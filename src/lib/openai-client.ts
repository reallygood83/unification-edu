/**
 * OpenAI API 클라이언트 유틸리티
 * - 모든 AI 기능을 하나의 통합 API로 관리
 */

import { Content, QuizQuestion } from '@/types';

/**
 * 통일 교육 관련 콘텐츠 검색
 */
export async function searchContents(query: string): Promise<Content[]> {
  try {
    console.log('통일 교육 콘텐츠 검색:', query);
    
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search',
        payload: { query }
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('검색 오류:', data.error);
    }
    
    // 데이터 구조화 및 변환
    const results = data.data?.results || [];
    return results.map(item => ({
      id: item.id,
      title: item.title,
      snippet: item.snippet,
      source: item.source,
      sourceUrl: item.url,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedDate,
      contentType: item.url.includes('youtube.com') ? 'video' : 'article'
    }));
  } catch (error) {
    console.error('콘텐츠 검색 중 오류:', error);
    return [];
  }
}

/**
 * 콘텐츠 URL에서 전체 텍스트 가져오기
 */
export async function getContentDetails(contentUrl: string): Promise<string> {
  try {
    console.log('콘텐츠 요약 요청:', contentUrl);
    
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'summarize',
        payload: { url: contentUrl }
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('요약 오류:', data.error);
    }
    
    return data.data?.summary || '콘텐츠를 불러올 수 없습니다.';
  } catch (error) {
    console.error('콘텐츠 요약 중 오류:', error);
    return '콘텐츠를 불러올 수 없습니다.';
  }
}

/**
 * 콘텐츠 기반 퀴즈 생성
 */
export async function generateQuiz(
  content: Content,
  category: string,
  difficulty: 'easy' | 'medium' | 'hard',
  questionCount: number = 5
): Promise<QuizQuestion[]> {
  try {
    console.log('퀴즈 생성 요청:', {
      title: content.title,
      category,
      difficulty,
      questionCount
    });
    
    // 콘텐츠 전체 텍스트가 없는 경우 가져오기
    if (!content.rawText) {
      content.rawText = await getContentDetails(content.sourceUrl);
    }
    
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate-quiz',
        payload: {
          content,
          category,
          difficulty,
          questionCount
        }
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('퀴즈 생성 오류:', data.error);
    }
    
    return data.data?.questions || [];
  } catch (error) {
    console.error('퀴즈 생성 중 오류:', error);
    return [];
  }
}