import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 어떤 URL이 오든 항상 같은 요약 텍스트를 반환
    return NextResponse.json({
      summary: "한반도의 평화와 통일은 우리 민족의 오랜 염원이자 과제입니다. 분단 이후 남북한은 서로 다른 체제와 이념 속에서 발전해왔으며, 이로 인한 사회문화적 이질감도 심화되었습니다. 그러나 평화와 공존, 그리고 상호 이해를 통해 단계적으로 통일을 이루어 나가는 것이 중요합니다. 통일 교육은 이러한 과정에서 미래 세대가 통일 한국의 주역으로 성장할 수 있도록 돕는 중요한 교육 과정입니다. 북한 사회와 문화에 대한 올바른 이해, 민주 시민 의식의 함양, 그리고 평화적 문제 해결 능력을 키우는 것이 통일 교육의 핵심 요소라 할 수 있습니다. 앞으로의 통일 교육은 단순한 지식 전달을 넘어 학생들이 능동적으로 참여하고 체험할 수 있는 다양한 프로그램을 통해 이루어져야 할 것입니다."
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "모의 요약 API에서 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}