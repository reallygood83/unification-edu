import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { content, category, difficulty, questionCount } = await request.json();
    
    // 환경 변수 로깅
    console.log('서버 API 환경 변수 확인:', {
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      env: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'not-vercel'
    });
    
    // 서버 측 환경 변수에서 API 키 가져오기
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API 키가 설정되지 않았습니다. 모의 데이터 반환');
      return NextResponse.json({
        questions: getMockQuizQuestions(content.title, category)
      });
    }
    
    // 서버 측에서 OpenAI 초기화
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });
    
    console.log('OpenAI API 서버 측 초기화 완료');
    
    // 사용 가능한 모델 목록 (우선순위 순)
    const models = ["gpt-4-0613", "gpt-4-turbo-preview", "gpt-4o", "gpt-4", "gpt-3.5-turbo"];
    let response = null;
    let modelError = null;
    
    // 각 모델 시도
    for (const model of models) {
      try {
        console.log(`OpenAI API - ${model} 모델로 서버 측 퀴즈 생성 시도`);
        
        const prompt = `
다음 통일교육 관련 콘텐츠를 바탕으로 ${questionCount}개의 ${difficulty} 난이도 객관식 문제를 생성해주세요.
카테고리: ${category}

콘텐츠 제목: ${content.title}
콘텐츠 내용: ${content.rawText || content.snippet}

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
        
        response = await openai.chat.completions.create({
          model: model,
          messages: [
            { 
              role: "system", 
              content: "당신은 교육 콘텐츠에서 퀴즈를 생성하는 전문가입니다. 주어진 콘텐츠를 정확히 이해하고 교육적인 가치가 있는 퀴즈 문항을 생성합니다." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        });
        
        // 성공하면 루프 종료
        break;
      } catch (error: any) {
        console.error(`${model} 모델 사용 중 오류:`, error.message);
        modelError = error;
        
        // 마지막 모델이 아니면 다음 모델 시도
        if (model === models[models.length - 1]) {
          console.error('모든 모델 시도 실패. 모의 데이터 반환');
          return NextResponse.json({
            questions: getMockQuizQuestions(content.title, category)
          });
        }
      }
    }
    
    if (!response) {
      throw new Error('OpenAI API 응답이 없습니다.');
    }
    
    const responseText = response.choices[0].message.content || '[]';
    
    // JSON 형식 추출 (문자열 내에서 JSON 형식 찾기)
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) {
      throw new Error('OpenAI API 응답에서 JSON 형식을 찾을 수 없습니다.');
    }
    
    const jsonText = jsonMatch[0];
    let generatedQuestions = [];
    
    try {
      generatedQuestions = JSON.parse(jsonText);
      
      // id 추가
      generatedQuestions = generatedQuestions.map((q, index) => ({
        ...q,
        id: `q-${Date.now()}-${index}`
      }));
    } catch (error) {
      throw new Error('JSON 파싱 오류: ' + error.message);
    }
    
    return NextResponse.json({ questions: generatedQuestions });
  } catch (error: any) {
    console.error('퀴즈 생성 API 오류:', error);
    const content = request.json().then(data => data.content);
    const category = request.json().then(data => data.category);
    
    // 오류 발생 시 모의 데이터 반환
    return NextResponse.json({
      questions: getMockQuizQuestions(
        (await content)?.title || '통일교육',
        await category || 'unification-basic'
      )
    });
  }
}

// 모의 퀴즈 데이터 생성 함수
function getMockQuizQuestions(contentTitle: string, category: string) {
  return [
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
      question: `"${contentTitle}"와 관련된 통일교육의 목표로 가장 적절한 것은?`,
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
      question: `'${category}' 카테고리에 대한 설명으로 가장 옳은 것은?`,
      options: [
        "북한의 정치체제와 경제구조에 대한 이해를 다룬다.",
        "통일 이후 사회통합의 방안과 과제에 대해 다룬다.",
        "한반도 통일의 국제적 환경과 외교적 과제를 다룬다.",
        "통일의 필요성과 통일 한반도의 미래상을 다룬다."
      ],
      correctAnswerIndex: 3,
      explanation: "해당 카테고리는 통일의 필요성과 통일 한반도의 미래상에 관한 내용을 담고 있습니다."
    }
  ];
}