import { NextRequest, NextResponse } from 'next/server';

// 테스트용 모의 퀴즈 데이터
const mockQuizzes = {
  "quiz-1746804352655": {
    id: "quiz-1746804352655",
    title: "한반도 평화와 통일의 이해",
    description: "한반도 평화와 통일에 대한 기본 개념과 과정을 이해하는 퀴즈입니다.",
    questions: [
      {
        id: "q-1746804352655-0",
        question: "한반도 분단의 국제적 배경으로 가장 적절한 것은?",
        options: [
          "제2차 세계대전 종전 이후 미국과 소련의 냉전 대립",
          "일본의 식민지배 정책에 대한 국제사회의 비판",
          "중국과 일본의 한반도 영토 분쟁",
          "유럽 열강들의 극동 아시아 패권 경쟁"
        ],
        correctAnswerIndex: 0,
        explanation: "한반도 분단은 제2차 세계대전 종전 이후 미국과 소련 간의 냉전 대립 구도 속에서 발생했습니다. 38선을 경계로 미군과 소련군이 각각 남과 북에 진주하면서 분단이 시작되었습니다."
      },
      {
        id: "q-1746804352655-1",
        question: "남북한 통일 정책에 대한 설명 중 가장 옳은 것은?",
        options: [
          "남한과 북한의 통일 정책은 동일한 방식과 과정을 추구한다.",
          "남한의 통일 정책은 평화적 통일을 기본 원칙으로 하고 있다.",
          "북한의 통일 정책은 자유민주주의 체제로의 통합을 지향한다.",
          "남북한 모두 제3국의 개입 없이 민족 내부 문제로만 해결하길 원한다."
        ],
        correctAnswerIndex: 1,
        explanation: "남한의 통일 정책은 평화적 통일을 기본 원칙으로 하며, 단계적이고 점진적인 방식의 통일을 추구합니다. 이는 한반도 평화 정착, 교류협력 활성화, 통일 기반 구축 등의 과정을 거치는 것을 의미합니다."
      },
      {
        id: "q-1746804352655-2",
        question: "남북한 간 화해와 협력을 이끌어 내기 위한 '7·4 남북공동성명'에서 합의한 통일 원칙이 아닌 것은?",
        options: [
          "자주적 해결",
          "평화적 방법",
          "민족대단결",
          "국제사회의 중재"
        ],
        correctAnswerIndex: 3,
        explanation: "1972년 발표된 7·4 남북공동성명은 '자주, 평화, 민족대단결'이라는 통일 3원칙을 제시했습니다. '국제사회의 중재'는 포함되지 않았으며, 오히려 '외세에 의존하거나 외세의 간섭을 받음이 없이' 자주적으로 해결해야 한다는 원칙을 강조했습니다."
      },
      {
        id: "q-1746804352655-3",
        question: "통일 교육의 목표로 가장 적절하지 않은 것은?",
        options: [
          "평화 의식 함양과 민주 시민 의식 고취",
          "북한 실상에 대한 객관적 이해 증진",
          "통일의 필요성 인식과 통일의지 함양",
          "반공 이데올로기 강화와 안보 의식 고취"
        ],
        correctAnswerIndex: 3,
        explanation: "현대의 통일 교육은 단순한 반공 교육이나 이데올로기적 접근을 지양하고, 객관적 북한 이해, 평화 의식 함양, 민주 시민 의식 고취, 통일의 필요성 인식 등을 목표로 합니다. '반공 이데올로기 강화'는 과거의 교육 방식으로, 현대적 통일 교육 목표로는 적절하지 않습니다."
      },
      {
        id: "q-1746804352655-4",
        question: "남북한 간 경제 협력 사업 중 개성공단에 대한 설명으로 옳은 것은?",
        options: [
          "북한의 수도 평양에 위치한 경제특구이다.",
          "남북한 합작 1호 사업으로 1990년대 초반에 시작되었다.",
          "남한의 자본과 기술, 북한의 토지와 노동력이 결합된 협력 사업이다.",
          "현재까지 중단 없이 지속적으로 운영되고 있다."
        ],
        correctAnswerIndex: 2,
        explanation: "개성공단은 남한의 자본과 기술, 북한의 토지와 노동력이 결합된 경제협력 사업으로, 북한 개성시에 위치해 있습니다. 2004년 12월 첫 제품이 생산되었으며, 2016년 2월 남북관계 악화로 전면 중단되었습니다."
      }
    ],
    category: "unification-basic",
    sourceContent: {
      id: "content-123",
      title: "한반도 평화와 통일의 이해",
      snippet: "한반도 평화와 통일 과정에서 고려해야 할 다양한 관점과 이슈들에 대한 종합적인 분석...",
      source: "통일부",
      sourceUrl: "https://example.com/unification-basic",
      imageUrl: "https://picsum.photos/id/237/200/200",
      contentType: "article"
    },
    createdAt: "2023-05-10T09:00:00Z",
    difficulty: "medium",
    targetGrade: ["elementary", "middle", "high"]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;
    const quiz = mockQuizzes[quizId];
    
    if (!quiz) {
      return NextResponse.json(
        { error: "퀴즈를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    return NextResponse.json(quiz);
  } catch (error: any) {
    return NextResponse.json(
      { error: "퀴즈 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}