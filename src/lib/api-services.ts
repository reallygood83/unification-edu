import { Content, PerplexitySearchResponse, Quiz, QuizQuestion } from '@/types';
import axios from 'axios';
import OpenAI from 'openai';

import { API_KEYS } from '@/lib/env';

// OpenAI API 키는 환경 변수 모듈에서 가져옴
// 클라이언트 측에서도 사용하므로 NEXT_PUBLIC_ 접두사 필요
const OPENAI_API_KEY = API_KEYS.OPENAI;

// OpenAI 클라이언트 초기화 (API 키가 있는 경우에만)
let openai: OpenAI;

try {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // 클라이언트 사이드에서 사용
    defaultQuery: { timeout: 30000 }, // 타임아웃 설정 (30초)
    defaultHeaders: { 'app-name': 'unification-edu' },
  });

  console.log('OpenAI 클라이언트가 성공적으로 초기화되었습니다.');
} catch (err) {
  console.error('OpenAI 클라이언트 초기화 오류:', err);

  // 폴백으로 최소한의 클라이언트 생성
  openai = new OpenAI({
    apiKey: 'dummy-key-for-initialization',
    dangerouslyAllowBrowser: true
  });
}

/**
 * Next.js API 라우트를 통해 Perplexity API 검색 요청
 */
export async function searchContents(query: string): Promise<Content[]> {
  try {
    console.log('검색 API 호출 시도:', query);
    
    // 1. 먼저 새로운 서버 측 API 호출 시도
    try {
      const response = await fetch('/api/perplexity-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error(`서버 API 응답 오류: ${response.status}`);
      }
      
      const searchData = await response.json() as PerplexitySearchResponse;
      
      if (!searchData.results || !Array.isArray(searchData.results)) {
        console.error('유효하지 않은 API 응답 형식:', searchData);
        throw new Error('유효하지 않은 API 응답 형식');
      }

      console.log('검색 결과 수:', searchData.results.length);
      
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
    } catch (serverApiError) {
      console.log('서버 API 호출 실패, 기존 API 시도:', serverApiError);
      
      // 2. 서버 API 실패 시 기존 API 시도
      try {
        const response = await axios.post('/api/search', { query });
  
        if (response.data.error) {
          throw new Error(`API 응답 오류: ${response.data.error}`);
        }
  
        const searchData = response.data as PerplexitySearchResponse;
        
        if (!searchData.results || !Array.isArray(searchData.results)) {
          console.error('유효하지 않은 API 응답 형식:', searchData);
          throw new Error('유효하지 않은 API 응답 형식');
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
      } catch (realApiError) {
        console.log('실제 API 호출 실패, 모의 API로 전환:', realApiError);
        
        // 3. 실제 API 실패 시 모의 API 사용
        try {
          const mockResponse = await axios.post('/api/mock/search', { query });
          const mockData = mockResponse.data as PerplexitySearchResponse;
          
          return mockData.results.map(item => ({
            id: item.id,
            title: item.title,
            snippet: item.snippet,
            source: item.source,
            sourceUrl: item.url,
            imageUrl: item.imageUrl,
            publishedAt: item.publishedDate,
            contentType: item.url.includes('youtube.com') ? 'video' : 'article'
          }));
        } catch (mockApiError) {
          console.error('모의 API도 실패:', mockApiError);
          throw mockApiError; // 모든 API 실패 시 상위 catch로 전달
        }
      }
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || '알 수 없는 오류';
    console.error('검색 오류 (모든 API 실패):', errorMessage);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('자세한 오류 정보:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    
    return []; // 모든 API 실패 시 빈 배열 반환
  }
}

/**
 * 특정 콘텐츠의 전체 텍스트 가져오기
 * Next.js API 라우트를 통해 Perplexity API에 요청
 */
export async function getContentDetails(contentUrl: string): Promise<string> {
  try {
    // 먼저 실제 API를 호출해보고, 실패하면 모의 API로 폴백
    try {
      // 자체 API 라우트를 통해 요약 API 호출
      const response = await axios.post('/api/summarize', { url: contentUrl });

      // API 응답이 오류를 포함하고 있는지 확인
      if (response.data.error) {
        throw new Error(`API 응답 오류: ${response.data.error}`);
      }

      return response.data.summary || '콘텐츠를 불러올 수 없습니다.';
    } catch (realApiError) {
      console.log('실제 요약 API 호출 실패, 모의 API로 전환:', realApiError);

      // 실제 API가 실패했을 때 모의 API를 사용
      const mockResponse = await axios.post('/api/mock/summarize', { url: contentUrl });
      return mockResponse.data.summary || '콘텐츠를 불러올 수 없습니다.';
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || '알 수 없는 오류';
    console.error('콘텐츠 상세 정보 가져오기 오류 (모든 API 실패):', errorMessage);

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

    // 사용 가능한 모델 목록 (우선순위 순) - OpenAI 공식 모델명 사용
    const models = ["gpt-4-0613", "gpt-4-turbo-preview", "gpt-4o", "gpt-4", "gpt-3.5-turbo"];
    let currentModelIndex = 0;
    let response;

    while (currentModelIndex < models.length) {
      const currentModel = models[currentModelIndex];
      try {
        console.log(`OpenAI API - ${currentModel} 모델로 퀴즈 생성 시도`);
        
        response = await openai.chat.completions.create({
          model: currentModel,
          messages: [
            { role: "system", content: "당신은 교육 콘텐츠에서 퀴즈를 생성하는 전문가입니다. 주어진 콘텐츠를 정확히 이해하고 교육적인 가치가 있는 퀴즈 문항을 생성합니다." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        });
        
        // 성공했으면 루프 종료
        break;
      } catch (modelError: any) {
        // 모델 접근 권한이 없거나 문제가 있으면 다음 모델 시도
        console.error(`${currentModel} 모델 사용 중 오류:`, modelError.message);
        
        if (currentModelIndex === models.length - 1) {
          // 마지막 모델까지 모두 실패한 경우 오류 발생
          throw new Error(`모든 OpenAI 모델 시도 실패: ${modelError.message}`);
        }
        
        // 다음 모델 시도
        currentModelIndex++;
      }
    }

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
 * 새 퀴즈 저장 (Supabase와 로컬 스토리지 모두 사용)
 */
export async function saveQuiz(quiz: Quiz): Promise<boolean> {
  try {
    // UUID 생성 함수
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    // 퀴즈 ID가 없으면 UUID 생성
    if (!quiz.id) {
      quiz.id = generateUUID();
    }

    console.log('퀴즈 저장 시작:', quiz.title);

    try {
      // Supabase DB에 저장 시도
      const { saveQuizToDB } = await import('./supabase-api');
      const savedId = await saveQuizToDB(quiz);

      if (savedId) {
        console.log('퀴즈가 Supabase에 성공적으로 저장됨, ID:', savedId);
      } else {
        console.warn('Supabase 저장 실패, 로컬 스토리지만 사용');
      }

      // 로컬 스토리지에도 항상 저장 (백업)
      const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[];
      savedQuizzes.push(quiz);
      localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));

      // 쿠키에도 저장 (서버 사이드에서 접근 가능하도록)
      if (typeof document !== 'undefined') {
        document.cookie = `savedQuizzes=${encodeURIComponent(JSON.stringify(savedQuizzes))}; path=/; max-age=86400`;
      }

      return true;
    } catch (dbError) {
      console.error('DB 저장 오류, 로컬 스토리지만 사용:', dbError);

      // 로컬 스토리지에만 저장
      const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[];
      savedQuizzes.push(quiz);
      localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));

      if (typeof document !== 'undefined') {
        document.cookie = `savedQuizzes=${encodeURIComponent(JSON.stringify(savedQuizzes))}; path=/; max-age=86400`;
      }

      return true; // 로컬 저장이 성공했으므로 true 반환
    }
  } catch (error) {
    console.error('퀴즈 저장 오류:', error);
    return false;
  }
}

/**
 * 저장된 모든 퀴즈 가져오기 (Supabase와 로컬 스토리지 모두 사용)
 */
export async function getAllQuizzes(): Promise<Quiz[]> {
  try {
    console.log('퀴즈 목록 가져오기 시작');

    try {
      // Supabase DB에서 퀴즈 가져오기 시도
      const { getAllQuizzesFromDB } = await import('./supabase-api');
      const dbQuizzes = await getAllQuizzesFromDB();

      if (dbQuizzes && dbQuizzes.length > 0) {
        console.log(`Supabase DB에서 ${dbQuizzes.length}개의 퀴즈를 불러왔습니다`);
        return dbQuizzes;
      } else {
        console.log('Supabase DB에서 퀴즈를 찾지 못함, 로컬 스토리지 확인');
      }
    } catch (dbError) {
      console.error('DB 퀴즈 가져오기 오류:', dbError);
    }

    // DB에서 가져오지 못한 경우 로컬 스토리지에서 가져오기
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[];
    console.log(`로컬 스토리지에서 ${savedQuizzes.length}개의 퀴즈를 불러왔습니다`);

    return savedQuizzes;
  } catch (error) {
    console.error('퀴즈 목록 가져오기 오류:', error);
    // 에러 발생 시 빈 배열 반환
    return [];
  }
}

/**
 * 동기식으로 로컬 스토리지에서만 퀴즈 가져오기
 * (이전 코드와의 호환성 유지)
 */
export function getAllQuizzesSync(): Quiz[] {
  try {
    return JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[];
  } catch (error) {
    console.error('로컬 스토리지 퀴즈 목록 가져오기 오류:', error);
    return [];
  }
}

/**
 * ID로 특정 퀴즈 가져오기 (비동기, 임시로 로컬 스토리지만 사용)
 */
export async function getQuizById(id: string): Promise<Quiz | null> {
  try {
    // 임시 모드: 로컬 스토리지에서만 퀴즈 가져오기
    console.log(`** 임시 모드: ID ${id}로 로컬 스토리지에서만 퀴즈 가져오기 **`);

    // 로컬 스토리지에서 퀴즈 찾기
    const quizzes = getAllQuizzesSync();
    const quiz = quizzes.find(q => q.id === id) || null;

    if (quiz) {
      console.log(`로컬 스토리지에서 퀴즈 "${quiz.title}"를 찾았습니다`);
    } else {
      console.log(`ID ${id}에 해당하는 퀴즈를 찾을 수 없습니다`);
    }

    return quiz;

    /* 비활성화된 Supabase 코드 - 테이블 스키마 준비 후 다시 활성화
    // 비동기 임포트로 순환 참조 방지
    const { getQuizByIdFromDB } = await import('./supabase-api');

    // DB에서 퀴즈 가져오기 시도
    const quiz = await getQuizByIdFromDB(id);
    return quiz;
    */
  } catch (error) {
    console.error(`ID ${id}로 퀴즈 가져오기 오류:`, error);
    return null;
  }
}

/**
 * ID로 특정 퀴즈 가져오기 (동기식, 이전 코드와의 호환성 유지)
 */
export function getQuizByIdSync(id: string): Quiz | null {
  try {
    const quizzes = getAllQuizzesSync();
    return quizzes.find(quiz => quiz.id === id) || null;
  } catch (error) {
    console.error('로컬 스토리지 퀴즈 가져오기 오류:', error);
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