import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    // 환경 변수 로깅
    console.log('Perplexity 서버 환경 변수 확인:', {
      hasKey: !!process.env.PERPLEXITY_API_KEY,
      keyLength: process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.length : 0,
      env: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'not-vercel'
    });
    
    // 서버 측 환경 변수에서 API 키 가져오기
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
    
    if (!PERPLEXITY_API_KEY) {
      console.error('Perplexity API 키가 설정되지 않았습니다. 모의 데이터 반환');
      return NextResponse.json(getMockSearchResults(query));
    }
    
    console.log('Perplexity API 호출 시도:', { query });

    const response = await axios.post(
      'https://api.perplexity.ai/search',
      { query },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10초 타임아웃 설정
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Perplexity API 검색 오류:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // 오류 발생 시 모의 데이터 반환
    const query = await request.json().then(data => data.query).catch(() => '통일교육');
    return NextResponse.json(getMockSearchResults(query));
  }
}

// 모의 검색 결과 데이터
function getMockSearchResults(query: string) {
  return {
    results: [
      {
        id: "mock-1",
        title: `한반도 평화와 통일에 대한 이해: ${query}`,
        snippet: "한반도 평화와 통일 과정에서 고려해야 할 다양한 관점과 이슈들에 대한 종합적인 분석...",
        source: "통일부",
        url: "https://example.com/unification-1",
        imageUrl: "https://picsum.photos/id/237/200/200",
        publishedDate: "2023-04-15T09:00:00Z"
      },
      {
        id: "mock-2",
        title: `남북 문화 교류의 역사와 의의: ${query} 관점`,
        snippet: "지난 수십 년간 이어져 온 남북 문화 교류의 역사적 흐름과 그 의의를 살펴보고 미래 전망을 제시...",
        source: "통일연구원",
        url: "https://example.com/unification-2",
        imageUrl: "https://picsum.photos/id/335/200/200",
        publishedDate: "2023-05-22T14:30:00Z"
      },
      {
        id: "mock-3",
        title: `통일 교육의 현재와 미래 방향성: ${query} 중심으로`,
        snippet: "미래 세대를 위한 통일 교육의 현황과 개선 방향에 대한 교육 전문가들의 제언...",
        source: "교육부",
        url: "https://example.com/unification-3",
        imageUrl: "https://picsum.photos/id/453/200/200",
        publishedDate: "2023-06-10T11:15:00Z"
      },
    ]
  };
}