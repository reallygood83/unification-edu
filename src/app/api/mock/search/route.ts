import { NextRequest, NextResponse } from 'next/server';

// 테스트용 더미 데이터
const mockSearchResults = {
  results: [
    {
      id: "mock-1",
      title: "한반도 평화와 통일에 대한 이해",
      snippet: "한반도 평화와 통일 과정에서 고려해야 할 다양한 관점과 이슈들에 대한 종합적인 분석...",
      source: "통일부",
      url: "https://example.com/unification-1",
      imageUrl: "https://picsum.photos/id/237/200/200",
      publishedDate: "2023-04-15T09:00:00Z"
    },
    {
      id: "mock-2",
      title: "남북 문화 교류의 역사와 의의",
      snippet: "지난 수십 년간 이어져 온 남북 문화 교류의 역사적 흐름과 그 의의를 살펴보고 미래 전망을 제시...",
      source: "통일연구원",
      url: "https://example.com/unification-2",
      imageUrl: "https://picsum.photos/id/335/200/200",
      publishedDate: "2023-05-22T14:30:00Z"
    },
    {
      id: "mock-3",
      title: "통일 교육의 현재와 미래 방향성",
      snippet: "미래 세대를 위한 통일 교육의 현황과 개선 방향에 대한 교육 전문가들의 제언...",
      source: "교육부",
      url: "https://example.com/unification-3",
      imageUrl: "https://picsum.photos/id/453/200/200",
      publishedDate: "2023-06-10T11:15:00Z"
    },
  ]
};

export async function POST(request: NextRequest) {
  try {
    // API 키가 없어도 항상 성공하는 모의 응답
    return NextResponse.json(mockSearchResults);
  } catch (error: any) {
    return NextResponse.json(
      { error: "모의 API에서 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}