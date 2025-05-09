import { NextRequest, NextResponse } from 'next/server';

// 테스트용 모의 퀴즈 목록 데이터
const mockQuizList = [
  {
    id: "quiz-1746804352655",
    title: "한반도 평화와 통일의 이해",
    description: "한반도 평화와 통일에 대한 기본 개념과 과정을 이해하는 퀴즈입니다.",
    category: "unification-basic",
    createdAt: "2023-05-10T09:00:00Z",
    difficulty: "medium",
    targetGrade: ["elementary", "middle", "high"],
    questionCount: 5
  },
  {
    id: "quiz-1746804352656",
    title: "남북 문화의 차이와 공통점",
    description: "남북한의 문화적 차이와 공통점을 이해하는 퀴즈입니다.",
    category: "unification-culture",
    createdAt: "2023-06-15T14:30:00Z",
    difficulty: "easy",
    targetGrade: ["elementary", "middle"],
    questionCount: 4
  },
  {
    id: "quiz-1746804352657",
    title: "통일 한반도의 미래 비전",
    description: "통일 후 한반도의 미래 비전과 가능성에 대해 알아보는 퀴즈입니다.",
    category: "unification-vision",
    createdAt: "2023-07-22T11:15:00Z",
    difficulty: "hard",
    targetGrade: ["middle", "high"],
    questionCount: 6
  }
];

export async function GET() {
  try {
    return NextResponse.json(mockQuizList);
  } catch (error: any) {
    return NextResponse.json(
      { error: "퀴즈 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}