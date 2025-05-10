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
        sourceUrl: "https://www.unikorea.go.kr/",
        imageUrl: "https://picsum.photos/id/237/200/200",
        publishedAt: "2023-04-15T09:00:00Z",
        isChildNews: false,
        relevanceScore: 90,
        educationTags: ["통일교육 핵심 자료"]
      },
      {
        id: "mock-2",
        title: `남북 문화 교류의 역사와 의의: ${query} 관점`,
        snippet: "지난 수십 년간 이어져 온 남북 문화 교류의 역사적 흐름과 그 의의를 살펴보고 미래 전망을 제시...",
        source: "통일연구원",
        sourceUrl: "https://www.kinu.or.kr/",
        imageUrl: "https://picsum.photos/id/335/200/200",
        publishedAt: "2023-05-22T14:30:00Z",
        isChildNews: false,
        relevanceScore: 85,
        educationTags: ["통일교육 핵심 자료"]
      },
      {
        id: "mock-3",
        title: `어린이를 위한 통일 이야기: ${query}`,
        snippet: "어린이들의 눈높이에 맞춘 통일 교육 콘텐츠로, 남북한의 문화와 생활, 평화의 중요성을 알기 쉽게 설명...",
        source: "어린이동아",
        sourceUrl: "https://kids.donga.com/",
        imageUrl: "https://picsum.photos/id/453/200/200",
        publishedAt: "2023-06-10T11:15:00Z",
        isChildNews: true,
        relevanceScore: 95,
        educationTags: ["통일교육 핵심 자료", "어린이 친화적"]
      },
    ]
  };
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { query, targetGrade } = requestData;
    
    // API 키 확인
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET || 
        NAVER_CLIENT_ID === 'your_naver_client_id_here' || 
        NAVER_CLIENT_SECRET === 'your_naver_client_secret_here') {
      
      console.error('네이버 API 키가 설정되지 않았습니다.', {
        hasClientId: !!NAVER_CLIENT_ID,
        hasClientSecret: !!NAVER_CLIENT_SECRET,
        clientIdValue: NAVER_CLIENT_ID === 'your_naver_client_id_here' ? '기본값 사용 중' : '커스텀 값 설정됨',
        clientSecretValue: NAVER_CLIENT_SECRET === 'your_naver_client_secret_here' ? '기본값 사용 중' : '커스텀 값 설정됨'
      });
      
      // 실제 API 키가 없으므로 모의 데이터 반환
      return NextResponse.json({
        success: true, // 클라이언트에 오류 없이 처리한 것처럼 전달
        mockDataUsed: true,
        message: 'API 키가 설정되지 않아 모의 데이터를 사용합니다. .env.local 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 올바르게 설정해주세요.',
        data: getMockData(query)
      });
    }

    // 환경 정보 로깅
    console.log('네이버 검색 API 요청:', {
      query,
      targetGrade,
      hasKeys: !!(NAVER_CLIENT_ID && NAVER_CLIENT_SECRET),
      env: process.env.NODE_ENV
    });

    try {
      // 학년에 따른 검색 최적화
      let searchQuery = '';
      let searchSort = 'sim'; // 기본 정렬: 정확도순
      
      // 대상 학년에 따른 검색어 최적화
      if (targetGrade === 'elementary') {
        // 초등학생용: 어린이 신문 + 쉬운 통일 관련 키워드
        searchQuery = `(어린이조선일보 OR 어린이동아 OR 어린이경제신문 OR 소년한국일보 OR 주니어조선 OR 어린이신문) ${query} (통일 OR 남북 OR 평화 OR 한반도)`;
        // 최근 기사 우선
        searchSort = 'date';
      } else if (targetGrade === 'high') {
        // 고등학생용: 심층 분석 키워드 추가
        searchQuery = `${query} (통일 OR 남북관계 OR 북한 OR 한반도 평화 OR 통일교육) (정책 OR 전략 OR 분석 OR 전망 OR 과제)`;
      } else {
        // 중학생용 (기본값): 일반 통일 관련 키워드
        searchQuery = `${query} (통일 OR 남북관계 OR 북한 OR 한반도 평화 OR 통일교육)`;
      }
      
      // 디버깅 정보 
      console.log('최적화된 검색어:', searchQuery);
      console.log('대상 학년:', targetGrade);
      console.log('정렬 방식:', searchSort);
      
      // 네이버 뉴스 API 호출 URL 구성
      const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(searchQuery)}&display=15&sort=${searchSort}`;
      console.log('네이버 API 호출 URL:', apiUrl);
      
      // 네이버 뉴스 API 호출
      const naverResponse = await fetch(apiUrl, {
        headers: {
          'X-Naver-Client-Id': NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_CLIENT_SECRET
        }
      });
      
      // 응답 상태 코드 확인
      if (!naverResponse.ok) {
        const errorText = await naverResponse.text();
        console.error(`네이버 API 응답 오류 (${naverResponse.status}):`, errorText);
        throw new Error(`네이버 API 응답 오류 (${naverResponse.status}): ${errorText}`);
      }
      
      // 응답 데이터 파싱
      const naverData = await naverResponse.json();
      console.log('네이버 API 응답 구조:', Object.keys(naverData));
      console.log('네이버 API 응답 항목 수:', naverData.items ? naverData.items.length : 0);
      
      // 결과가 없는 경우 처리
      if (!naverData.items || naverData.items.length === 0) {
        console.log('검색 결과가 없습니다. 모의 데이터 반환');
        return NextResponse.json({
          success: true,
          mockDataUsed: true,
          message: '검색 결과가 없어 모의 데이터를 사용합니다.',
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

        // 출처 추출 (도메인 또는 언론사명 추출)
        const urlObj = new URL(item.link);
        let source = urlObj.hostname.replace('www.', '');

        // 어린이 신문 여부 확인
        const isChildNews =
          item.link.includes('kids.donga.com') ||
          item.link.includes('kids.chosun.com') ||
          item.link.includes('kid.chosun.com') ||
          item.link.includes('kids.hankooki.com') ||
          cleanTitle.includes('어린이') ||
          cleanTitle.includes('주니어') ||
          source.includes('kids') ||
          source.includes('junior') ||
          source.includes('child');

        // 어린이 신문인 경우 출처 이름 변경
        if (isChildNews) {
          if (source.includes('donga')) source = '어린이동아';
          else if (source.includes('chosun')) source = '어린이조선';
          else if (source.includes('hankooki')) source = '소년한국일보';
          else source = source + ' (어린이신문)';
        }

        // 통일 교육 관련성 점수 산출 (0-100)
        const relevanceKeywords = ['통일', '남북', '북한', '한반도', '평화', '통일교육'];
        let relevanceScore = 0;

        // 제목과 내용에서 키워드 검색
        const fullText = (cleanTitle + ' ' + cleanDesc).toLowerCase();
        relevanceKeywords.forEach(keyword => {
          if (fullText.includes(keyword.toLowerCase())) {
            relevanceScore += 20; // 키워드당 20점, 최대 100점
          }
        });

        // 점수 제한 100점
        relevanceScore = Math.min(relevanceScore, 100);

        // 어린이 신문은 우선순위 부여 (관련성 점수 보너스)
        if (isChildNews && targetGrade === 'elementary') {
          relevanceScore += 50; // 어린이 신문에 보너스 점수
        }

        // 통일교육 관련성 설명 추가
        const educationTags = [];

        if (relevanceScore >= 80) {
          educationTags.push('통일교육 핵심 자료');
        } else if (relevanceScore >= 50) {
          educationTags.push('통일교육 관련 자료');
        }

        if (isChildNews) {
          educationTags.push('어린이 친화적');
        }

        // 임시 이미지 아이디 생성 (1-1000 사이)
        const imageId = Math.floor(Math.random() * 1000) + 1;

        return {
          id: `naver-${Date.now()}-${index}`,
          title: cleanTitle,
          snippet: cleanDesc,
          source: source,
          sourceUrl: item.link,
          imageUrl: `https://picsum.photos/id/${imageId}/200/200`, // 임시 이미지
          publishedAt: item.pubDate,
          isChildNews: isChildNews,
          relevanceScore: relevanceScore,
          educationTags: educationTags
        };
      });

      // 관련성 점수 기준으로 정렬 (높은 점수가 먼저 오도록)
      transformedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // 성공 응답 반환
      return NextResponse.json({
        success: true,
        mockDataUsed: false,
        data: { results: transformedResults }
      });
      
    } catch (apiError: any) {
      console.error(`네이버 API 오류:`, apiError);
      
      // 오류 발생 시 모의 데이터 반환
      return NextResponse.json({
        success: true, // 클라이언트에는 성공으로 전달
        mockDataUsed: true,
        message: `API 오류가 발생하여 모의 데이터를 사용합니다: ${apiError.message}`,
        data: getMockData(query)
      });
    }
  } catch (error: any) {
    console.error('네이버 검색 API 라우트 오류:', error);
    
    // 심각한 오류 발생 시에도 모의 데이터 반환
    return NextResponse.json({
      success: true, // 클라이언트에는 성공으로 전달
      mockDataUsed: true,
      message: `서버 오류가 발생하여 모의 데이터를 사용합니다: ${error.message}`,
      data: getMockData('통일')
    });
  }
}