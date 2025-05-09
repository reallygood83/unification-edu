import { Content, PerplexitySearchResponse, Quiz, QuizQuestion } from '@/types';
import axios from 'axios';
import OpenAI from 'openai';

// OpenAI API 키는 환경 변수를 통해 관리
// 클라이언트 측에서도 사용하므로 NEXT_PUBLIC_ 접두사 필요
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // 클라이언트 사이드에서 사용 (실제 서비스에서는 서버에서만 사용하는 것이 바람직)
});

/**
 * Next.js API 라우트를 통해 Perplexity API 검색 요청
 */
export async function searchContents(query: string): Promise<Content[]> {
  try {
    // 자체 API 라우트를 통해 호출
    const response = await axios.post('/api/search', { query });

    // API 응답이 오류를 포함하고 있는지 확인
    if (response.data.error) {
      throw new Error(`API 응답 오류: ${response.data.error}`);
    }

    const searchData = response.data as PerplexitySearchResponse;

    if (!searchData.results || !Array.isArray(searchData.results)) {
      console.error('유효하지 않은 API 응답 형식:', searchData);
      return [];
    }

    // API 응답을 우리 애플리케이션의 Content 타입으로 변환
    return searchData.results.map(item => ({
      id: item.id,
      title: item.title,
      snippet: item.snippet,
      source: item.source,
      sourceUrl: item.url,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedDate,
      contentType: item.url.includes('youtube.com') ? 'video' : 'article'
    }));
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || '알 수 없는 오류';
    console.error('Perplexity API 검색 오류:', errorMessage);

    // 개발 모드에서만 콘솔에 자세한 오류 정보 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('자세한 오류 정보:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }

    return [];
  }
}

/**
 * 특정 콘텐츠의 전체 텍스트 가져오기
 * Next.js API 라우트를 통해 Perplexity API에 요청
 */
export async function getContentDetails(contentUrl: string): Promise<string> {
  try {
    // 자체 API 라우트를 통해 요약 API 호출
    const response = await axios.post('/api/summarize', { url: contentUrl });

    // API 응답이 오류를 포함하고 있는지 확인
    if (response.data.error) {
      throw new Error(`API 응답 오류: ${response.data.error}`);
    }

    return response.data.summary || '콘텐츠를 불러올 수 없습니다.';
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || '알 수 없는 오류';
    console.error('콘텐츠 상세 정보 가져오기 오류:', errorMessage);

    // 개발 모드에서만 콘솔에 자세한 오류 정보 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('자세한 오류 정보:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }

    return '콘텐츠를 불러올 수 없습니다.';
  }
}

/**
 * OpenAI API를 사용하여 주어진 콘텐츠에서 퀴즈 생성
 */
export async function generateQuiz(
  content: Content, 
  category: string, 
  difficulty: 'easy' | 'medium' | 'hard', 
  questionCount: number = 5
): Promise<QuizQuestion[]> {
  try {
    // 콘텐츠 전체 텍스트가 없는 경우 가져오기
    if (!content.rawText) {
      content.rawText = await getContentDetails(content.sourceUrl);
    }
    
    const prompt = `
다음 통일교육 관련 콘텐츠를 바탕으로 ${questionCount}개의 ${difficulty} 난이도 객관식 문제를 생성해주세요.
카테고리: ${category}

콘텐츠 제목: ${content.title}
콘텐츠 내용: ${content.rawText}

각 문제는 다음 형식으로 JSON 배열 형태로 출력해주세요:
[
  {
    "question": "문제 내용",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "correctAnswerIndex": 정답 인덱스(0-3),
    "explanation": "정답에 대한 설명"
  },
  ...
]

다음 사항을 반드시 지켜주세요:
1. 문제는 주어진 콘텐츠 내용에 충실해야 합니다.
2. 정답은 명확해야 하며, options 배열의 인덱스(0부터 시작)로 표시합니다.
3. 각 문제의 보기는 모두 4개씩 제공해야 합니다.
4. 문제 난이도는 ${difficulty}로 설정해주세요.
5. 답변은 반드시 완전한 JSON 형식이어야 합니다.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "당신은 교육 콘텐츠에서 퀴즈를 생성하는 전문가입니다. 주어진 콘텐츠를 정확히 이해하고 교육적인 가치가 있는 퀴즈 문항을 생성합니다." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const responseText = response.choices[0].message.content || '[]';
    
    // JSON 형식 추출 (문자열 내에서 JSON 형식 찾기)
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('OpenAI API 응답에서 JSON 형식을 찾을 수 없습니다.');
    }
    
    const jsonText = jsonMatch[0];
    const generatedQuestions = JSON.parse(jsonText) as Omit<QuizQuestion, 'id'>[];
    
    // id 추가
    return generatedQuestions.map((q, index) => ({
      ...q,
      id: `q-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error('퀴즈 생성 오류:', error);
    return [];
  }
}

/**
 * 새 퀴즈 저장 (localStorage 사용, 실제 구현에서는 데이터베이스 사용)
 */
export function saveQuiz(quiz: Quiz): boolean {
  try {
    // 기존 퀴즈 목록 가져오기
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[];
    
    // 새 퀴즈 추가
    savedQuizzes.push(quiz);
    
    // 저장
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
    return true;
  } catch (error) {
    console.error('퀴즈 저장 오류:', error);
    return false;
  }
}

/**
 * 저장된 모든 퀴즈 가져오기
 */
export function getAllQuizzes(): Quiz[] {
  try {
    return JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[];
  } catch (error) {
    console.error('퀴즈 목록 가져오기 오류:', error);
    return [];
  }
}

/**
 * ID로 특정 퀴즈 가져오기
 */
export function getQuizById(id: string): Quiz | null {
  try {
    const quizzes = getAllQuizzes();
    return quizzes.find(quiz => quiz.id === id) || null;
  } catch (error) {
    console.error('퀴즈 가져오기 오류:', error);
    return null;
  }
}

/**
 * 인증서 생성 (학생이 5일 연속으로 퀴즈를 푼 경우)
 */
export function generateCertificate(studentName: string): string {
  const certId = `cert-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];
  
  return `
    <div class="certificate">
      <h1>통일교육 수료 인증서</h1>
      <p>이 인증서는 <strong>${studentName}</strong> 학생이 통일교육 퀴즈 프로그램을 성공적으로 완료했음을 증명합니다.</p>
      <p>발급일: ${today}</p>
      <p>인증번호: ${certId}</p>
    </div>
  `;
} 