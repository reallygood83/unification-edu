import { NextRequest, NextResponse } from 'next/server';

// 네이버 API 키는 서버 측에서만 사용
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

// 모의 데이터 생성 (API 키 없거나 오류 발생 시 사용)
function getMockData(query: string) {
  return {
    results: [
      {
        id: "mock-1",
        title: `한반도 평화와 통일에 대한 이해: ${query}`,
        snippet: "한반도 평화와 통일 과정에서 고려해야 할 다양한 관점과 이슈들에 대한 종합적인 분석...",
        source: "통일부",
        sourceUrl: "https://example.com/unification-1",
        imageUrl: "https://picsum.photos/id/237/200/200",
        publishedAt: "2023-04-15T09:00:00Z"
      },
      {
        id: "mock-2",
        title: `남북 문화 교류의 역사와 의의: ${query} 관점`,
        snippet: "지난 수십 년간 이어져 온 남북 문화 교류의 역사적 흐름과 그 의의를 살펴보고 미래 전망을 제시...",
        source: "통일연구원",
        sourceUrl: "https://example.com/unification-2",
        imageUrl: "https://picsum.photos/id/335/200/200",
        publishedAt: "2023-05-22T14:30:00Z"
      },
      {
        id: "mock-3",
        title: `통일 교육의 현재와 미래 방향성: ${query} 중심으로`,
        snippet: "미래 세대를 위한 통일 교육의 현황과 개선 방향에 대한 교육 전문가들의 제언...",
        source: "교육부",
        sourceUrl: "https://example.com/unification-3",
        imageUrl: "https://picsum.photos/id/453/200/200",
        publishedAt: "2023-06-10T11:15:00Z"
      },
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    // API 키 확인
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      console.error('네이버 API 키가 설정되지 않았습니다.');
      return NextResponse.json({
        success: false,
        error: 'API 키가 설정되지 않았습니다.',
        data: getMockData(query)
      });
    }
    
    // 환경 정보 로깅
    console.log('네이버 검색 API 요청:', {
      query,
      hasKeys: !!(NAVER_CLIENT_ID && NAVER_CLIENT_SECRET),
      env: process.env.NODE_ENV
    });
    
    try {
      // 네이버 뉴스 API 호출 - 통일 교육 관련 뉴스 검색
      const searchQuery = `${query} 통일`;
      const naverResponse = await fetch(
        `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(searchQuery)}&display=10`,
        {
          headers: {
            'X-Naver-Client-Id': NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
          }
        }
      );
      
      if (!naverResponse.ok) {
        throw new Error(`네이버 API 응답 오류: ${naverResponse.status}`);
      }
      
      const naverData = await naverResponse.json();
      
      // 결과가 없는 경우 처리
      if (naverData.items.length === 0) {
        console.log('검색 결과가 없습니다. 모의 데이터 반환');
        return NextResponse.json({
          success: true,
          data: getMockData(query)
        });
      }
      
      // 네이버 API 결과를 우리 앱 형식으로 변환
      const transformedResults = naverData.items.map((item, index) => {
        // HTML 태그 및 특수 문자 제거
        const cleanTitle = item.title
          .replace(/<[^>]*>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        
        const cleanDesc = item.description
          .replace(/<[^>]*>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        
        // 출처 추출 (간단한 도메인 추출)
        const urlObj = new URL(item.link);
        const source = urlObj.hostname.replace('www.', '');
        
        return {
          id: `naver-${Date.now()}-${index}`,
          title: cleanTitle,
          snippet: cleanDesc,
          source: source,
          sourceUrl: item.link,
          imageUrl: `https://picsum.photos/id/${(Math.floor(Math.random() * 1000) + 1)}/200/200`, // 임시 이미지
          publishedAt: item.pubDate
        };
      });
      
      return NextResponse.json({
        success: true,
        data: { results: transformedResults }
      });
      
    } catch (apiError: any) {
      console.error(`네이버 API 오류:`, apiError);
      
      // 오류 발생 시 모의 데이터 반환
      return NextResponse.json({
        success: false,
        error: apiError.message || '요청 처리 중 오류가 발생했습니다',
        data: getMockData(query)
      });
    }
  } catch (error: any) {
    console.error('네이버 검색 API 라우트 오류:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '요청 처리 중 오류가 발생했습니다',
      data: null
    }, { status: 500 });
  }
}