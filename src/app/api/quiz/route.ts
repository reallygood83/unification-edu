import { NextRequest, NextResponse } from 'next/server';

/**
 * 퀴즈 API - ID로 퀴즈 조회 (query parameter 사용)
 * 서버 사이드에서는 localStorage를 사용할 수 없으므로
 * 기본 데모 퀴즈 데이터를 제공합니다.
 */
export async function GET(request: NextRequest) {
  try {
    // URL에서 id 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('id');

    if (!quizId) {
      return NextResponse.json(
        { error: '퀴즈 ID가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 로그 추가
    console.log(`퀴즈 API 호출 - 퀴즈 ID: ${quizId}`);

    // 데모 퀴즈 데이터 생성 (실제로는 데이터베이스에서 가져와야 함)
    const demoQuiz = {
      id: quizId,
      title: "한반도 평화와 통일에 대한 이해",
      description: "한반도 평화와 통일에 관한 기초 지식을 테스트하는 퀴즈입니다.",
      questions: [
        {
          id: `q-${Date.now()}-0`,
          question: "한반도 분단의 국제적 배경으로 가장 적절한 것은?",
          options: [
            "제2차 세계대전 종전 이후 미국과 소련의 냉전 대립",
            "일본의 식민지배 정책에 대한 국제사회의 비판",
            "중국과 일본의 한반도 영토 분쟁",
            "유럽 열강들의 극동 아시아 패권 경쟁"
          ],
          correctAnswerIndex: 0,
          explanation: "한반도 분단은 제2차 세계대전 종전 이후 미국과 소련 간의 냉전 대립 구도 속에서 발생했습니다."
        },
        {
          id: `q-${Date.now()}-1`,
          question: "남북한 통일 정책에 대한 설명 중 가장 옳은 것은?",
          options: [
            "남한과 북한의 통일 정책은 동일한 방식과 과정을 추구한다.",
            "남한의 통일 정책은 평화적 통일을 기본 원칙으로 하고 있다.",
            "북한의 통일 정책은 자유민주주의 체제로의 통합을 지향한다.",
            "남북한 모두 제3국의 개입 없이 민족 내부 문제로만 해결하길 원한다."
          ],
          correctAnswerIndex: 1,
          explanation: "남한의 통일 정책은 평화적 통일을 기본 원칙으로 하며, 단계적이고 점진적인 방식의 통일을 추구합니다."
        },
        {
          id: `q-${Date.now()}-2`,
          question: "통일교육의 목표로 가장 적절한 것은?",
          options: [
            "평화 의식 함양과 민주 시민 의식 고취",
            "북한 실상에 대한 객관적 이해 증진",
            "통일의 필요성 인식과 통일의지 함양",
            "반공 이데올로기 강화와 안보 의식 고취"
          ],
          correctAnswerIndex: 2,
          explanation: "통일교육은 통일의 필요성을 인식하고 통일에 대한 의지를 함양하는 것을 중요한 목표로 합니다."
        },
        {
          id: `q-${Date.now()}-3`,
          question: "남북한 간 경제 협력의 사례로 볼 수 없는 것은?",
          options: [
            "개성공단 조성 사업",
            "금강산 관광 사업",
            "남북 철도 연결 사업",
            "평화 수역 공동 관할 사업"
          ],
          correctAnswerIndex: 3,
          explanation: "평화 수역 공동 관할 사업은 실제로 진행된 남북 경제 협력 사례가 아닙니다. 개성공단, 금강산 관광, 남북 철도 연결은 실제 진행되었던 경제 협력 사례입니다."
        },
        {
          id: `q-${Date.now()}-4`,
          question: "통일 한국의 미래상으로 적절하지 않은 것은?",
          options: [
            "정치적 민주화와 경제적 선진화를 이룬 국가",
            "다양성과 통일성이 조화를 이루는 사회",
            "동북아 평화와 번영을 선도하는 중심 국가",
            "강대국에 의존적인 국제 관계를 유지하는 국가"
          ],
          correctAnswerIndex: 3,
          explanation: "통일 한국의 바람직한 미래상은 강대국에 의존적인 관계가 아닌, 자주적이고 균형 있는 국제 관계를 형성하는 국가입니다."
        }
      ],
      category: "unification_understanding",
      sourceContent: {
        id: "demo-content-1",
        title: "한반도 평화와 통일에 대한 이해",
        snippet: "한반도 평화와 통일 과정에서 고려해야 할 다양한 관점과 이슈들에 대한 종합적인 분석...",
        source: "통일부",
        sourceUrl: "https://www.unikorea.go.kr/",
        imageUrl: "https://picsum.photos/id/237/200/200",
        publishedAt: "2023-04-15T09:00:00Z",
        contentType: "article"
      },
      createdAt: new Date().toISOString(),
      difficulty: "medium",
      targetGrade: ["elementary", "middle", "high"],
    };

    return NextResponse.json(demoQuiz);
  } catch (error) {
    console.error('퀴즈 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}