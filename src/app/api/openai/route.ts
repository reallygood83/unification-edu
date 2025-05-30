import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// API 키는 서버 측에서만 사용
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAI 클라이언트 초기화
let openai: OpenAI;
try {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY
  });
} catch (err) {
  console.error('OpenAI 클라이언트 초기화 오류:', err);
}

export async function POST(request: NextRequest) {
  try {
    const { action, payload } = await request.json();
    
    // API 키 확인
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API 키가 설정되지 않았습니다.');
      return NextResponse.json({
        success: false,
        error: 'API 키가 설정되지 않았습니다.',
        data: getMockData(action, payload)
      });
    }
    
    // 환경 정보 로깅
    console.log('OpenAI API 요청:', {
      action,
      hasKey: !!OPENAI_API_KEY,
      env: process.env.NODE_ENV
    });
    
    try {
      switch (action) {
        // 콘텐츠 검색 액션
        case 'search':
          return await handleSearch(payload.query);
        
        // 퀴즈 생성 액션
        case 'generate-quiz':
          return await handleGenerateQuiz(
            payload.content,
            payload.category,
            payload.difficulty,
            payload.questionCount
          );
          
        // 콘텐츠 요약 액션
        case 'summarize':
          return await handleSummarize(payload.url, payload.text);
          
        default:
          throw new Error(`지원하지 않는 액션: ${action}`);
      }
    } catch (apiError) {
      console.error(`OpenAI API 오류 (${action}):`, apiError);
      
      // 오류 발생 시 모의 데이터 반환
      return NextResponse.json({
        success: false,
        error: apiError.message || '요청 처리 중 오류가 발생했습니다',
        data: getMockData(action, payload)
      });
    }
  } catch (error: any) {
    console.error('OpenAI API 라우트 오류:', error);
    return NextResponse.json({
      success: false,
      error: error.message || '요청 처리 중 오류가 발생했습니다',
      data: null
    }, { status: 500 });
  }
}

/**
 * 통일 교육 관련 검색 처리
 */
async function handleSearch(query: string) {
  // 모델과 시스템 메시지 설정
  const model = "gpt-4-turbo-preview";
  const systemMessage = `
    당신은 통일 교육에 관한 정보를 제공하는 검색 도우미입니다.
    사용자의 쿼리에 기반해 통일 교육 관련 가상의 기사, 논문, 자료 등을 검색 결과 형태로 제공하세요.
    검색 결과는 다음 JSON 형식으로 제공하세요:
    {
      "results": [
        {
          "id": "고유 ID",
          "title": "콘텐츠 제목",
          "snippet": "콘텐츠 요약 (약 100자)",
          "source": "출처 (예: 통일부, 통일연구원 등)",
          "url": "가상의 URL",
          "imageUrl": "https://picsum.photos/id/NUMBER/200/200 형식의 랜덤 이미지 URL",
          "publishedDate": "ISO 형식의 날짜 (최근 3년 이내)"
        },
        ... (총 3-5개 결과)
      ]
    }
    
    각 검색 결과는 한반도 통일, 남북한 관계, 통일 교육, 평화 교육 등과 관련된 내용이어야 합니다.
    검색 결과는 실제처럼 다양한 출처, 날짜를 가져야 합니다.
    이미지 URL은 항상 https://picsum.photos/id/NUMBER/200/200 형식으로 제공하세요 (NUMBER는 1-1000 사이의 랜덤 숫자).
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `다음 키워드 관련 통일 교육 자료를 검색해주세요: ${query}` }
      ],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content || '{}';
    const searchData = JSON.parse(content);
    
    return NextResponse.json({
      success: true,
      data: searchData
    });
  } catch (error) {
    console.error('검색 처리 중 오류:', error);
    throw error;
  }
}

/**
 * 퀴즈 생성 처리
 */
async function handleGenerateQuiz(
  content: any,
  category: string,
  difficulty: string,
  questionCount: number = 5
) {
  // 먼저 콘텐츠 요약이 필요할 경우 요약 생성
  if (!content.rawText && content.sourceUrl) {
    try {
      const summaryResponse = await handleSummarize(content.sourceUrl);
      const summaryData = await summaryResponse.json();
      
      if (summaryData.success && summaryData.data && summaryData.data.summary) {
        content.rawText = summaryData.data.summary;
      }
    } catch (err) {
      console.error('콘텐츠 요약 실패:', err);
      // 요약 실패 시 스니펫 사용
      content.rawText = content.snippet || '콘텐츠 내용을 불러올 수 없습니다.';
    }
  }
  
  // 난이도에 따른 학년 수준 매핑
  const gradeLevelMap = {
    'easy': '초등학교',
    'medium': '중학교',
    'hard': '고등학교'
  };

  // 학년 수준 텍스트
  const gradeLevel = gradeLevelMap[difficulty as keyof typeof gradeLevelMap] || '중학교';

  // 퀴즈 생성 프롬프트
  const prompt = `
당신은 통일교육 전문가로서 학생들이 남북한의 문화, 역사, 평화, 통일의 필요성을 이해할 수 있도록 교육적이고 흥미로운 퀴즈를 제작합니다.
다음 통일교육 관련 콘텐츠를 바탕으로 ${gradeLevel} 학생들의 수준에 맞는 ${questionCount}개의 객관식 문제를 생성해주세요.

## 퀴즈 기본 정보
- 카테고리: ${category}
- 대상 학년: ${gradeLevel}
- 난이도: ${difficulty}
- 콘텐츠 제목: ${content.title}
- 콘텐츠 내용: ${content.rawText}

## 교육적 목표
이 퀴즈는 단순한 지식 테스트가 아닌, 학생들이 통일의 의미와 가치를 이해하고 평화적 통일의 필요성을 인식하도록 하는 교육적 목표를 가지고 있습니다.
학생들이 단편적 지식을 암기하는 것이 아니라, 비판적 사고력을 기르고 통일에 대한 긍정적 인식을 형성할 수 있도록 문제를 설계해주세요.

## 대상 수준별 지침
${difficulty === 'easy' ? `
- 초등학생 대상이므로 쉽고 명확한 단어와 문장 사용
- 질문은 흥미를 유발하는 방식으로 짧고 간결하게 작성
- 핵심 개념에 초점을 맞추고 복잡한 용어는 피함
- 정답이 명확하고 추론 과정이 단순한 문제 제시
- 사례나 구체적인 상황을 제시하여 이해를 도움
` : difficulty === 'medium' ? `
- 중학생 대상이므로 적절한 수준의 전문용어 사용 가능
- 논리적 사고력이 필요한 문제 구성
- 단순 암기를 넘어 원인과 결과를 연결하는 문제 포함
- 통일 과정에서 발생할 수 있는 다양한 관점 제시
- 실생활과 연관된 문제를 통해 통일 교육의 실용성 강조
` : `
- 고등학생 대상이므로 심도 있는 사고를 요구하는 문제 구성
- 국제 관계, 경제, 사회적 측면에서 통일 문제를 다각도로 분석
- 통일 과정의 복잡성과 현실적 과제에 대한 이해 요구
- 비판적 사고와 문제 해결 능력을 평가하는 문제 포함
- 학술적인 용어와 개념을 적절히 활용
`}

## 출력 형식
각 문제는 다음 JSON 형식으로 출력해주세요:
{
  "questions": [
    {
      "id": "q-${Date.now()}-0",
      "question": "문제 내용",
      "options": ["보기1", "보기2", "보기3", "보기4"],
      "correctAnswerIndex": 정답 인덱스(0-3),
      "explanation": "정답에 대한 설명 및 교육적 의미"
    },
    ... (총 ${questionCount}개 문제)
  ]
}

## 필수 규칙
1. 문제는 반드시 주어진 콘텐츠 내용에 충실해야 합니다.
2. 정답은 명확해야 하며, options 배열의 인덱스(0부터 시작)로 표시합니다.
3. 각 문제의 보기는 모두 4개씩 제공하고, 오답도 그럴듯하게 작성합니다.
4. 문제 설명에는 단순히 정답을 알려주는 것을 넘어, 이 질문이 통일교육에서 왜 중요한지 교육적 의미를 포함합니다.
5. 남북한의 대립적 관점보다는 상호 이해와 평화적 공존의 가치를 강조합니다.
6. 답변은 반드시 완전한 JSON 형식이어야 합니다.
`;

  try {
    // 사용 가능한 모델 목록 (우선순위 순)
    const models = ["gpt-4-0613", "gpt-4-turbo-preview", "gpt-4o", "gpt-4", "gpt-3.5-turbo"];
    
    // 각 모델 시도
    for (const model of models) {
      try {
        console.log(`OpenAI API - ${model} 모델로 퀴즈 생성 시도`);
        
        // 난이도에 맞는 시스템 메시지 생성
        const systemMessage = `당신은 통일교육 전문가로서 ${gradeLevel} 학생들을 위한 교육용 퀴즈를 만드는 역할을 맡고 있습니다.
통일교육의 목표는 단순한 지식 전달이 아닌, 학생들이 평화와 공존의 가치를 이해하고 통일의 필요성에 공감하도록 하는 것입니다.
${difficulty === 'easy' ?
  '초등학생들은 구체적이고 쉬운 언어로 설명된 개념을 더 잘 이해하므로, 단순하고 명확한 문제를 제시하세요.' :
difficulty === 'medium' ?
  '중학생들은 원인과 결과를 연결하는 능력이 발달하는 시기로, 논리적 사고력을 자극하는 문제를 제시하세요.' :
  '고등학생들은 비판적 사고와 복합적 분석이 가능하므로, 여러 관점에서 통일 문제를 분석하는 심도 있는 문제를 제시하세요.'}
항상 학생들이 통일에 대한 긍정적 인식을 가질 수 있도록 균형 잡힌 관점을 제시하며, 정치적 편향이 아닌 인도주의적, 문화적, 역사적 가치를 강조하세요.`;

        const response = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        });
        
        const content = response.choices[0].message.content || '{}';
        const quizData = JSON.parse(content);
        
        return NextResponse.json({
          success: true,
          data: quizData
        });
      } catch (modelError) {
        console.error(`${model} 모델 사용 중 오류:`, modelError);
        
        // 마지막 모델이 아니면 다음 모델 시도
        if (model === models[models.length - 1]) {
          throw new Error(`모든 모델 시도 실패: ${modelError.message}`);
        }
      }
    }
    
    throw new Error('모든 모델 시도 실패');
  } catch (error) {
    console.error('퀴즈 생성 중 오류:', error);
    throw error;
  }
}

/**
 * 콘텐츠 요약 처리
 */
async function handleSummarize(url?: string, text?: string) {
  // URL이나 텍스트 중 하나는 제공되어야 함
  if (!url && !text) {
    throw new Error('URL 또는 텍스트가 필요합니다');
  }
  
  const prompt = url 
    ? `다음 URL의 콘텐츠를 요약해주세요: ${url}. 
       이 URL에 접근할 수 없으므로, 통일 교육과 관련된 가상의 콘텐츠를 생성하고 요약해주세요.
       이 콘텐츠는 한반도 통일, 남북한 관계, 통일 교육 등과 관련된 내용이어야 합니다.`
    : `다음 텍스트를 요약해주세요: ${text}`;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "당신은 텍스트 요약 전문가입니다. 주어진 콘텐츠를 간결하게 요약합니다." },
        { role: "user", content: prompt }
      ],
    });
    
    const summary = response.choices[0].message.content || '요약을 생성할 수 없습니다.';
    
    return NextResponse.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('요약 처리 중 오류:', error);
    throw error;
  }
}

/**
 * 모의 데이터 생성 (API 키 없거나 오류 발생 시 사용)
 */
function getMockData(action: string, payload: any) {
  switch (action) {
    case 'search':
      return {
        results: [
          {
            id: "mock-1",
            title: `한반도 평화와 통일에 대한 이해: ${payload.query}`,
            snippet: "한반도 평화와 통일 과정에서 고려해야 할 다양한 관점과 이슈들에 대한 종합적인 분석...",
            source: "통일부",
            url: "https://example.com/unification-1",
            imageUrl: "https://picsum.photos/id/237/200/200",
            publishedDate: "2023-04-15T09:00:00Z"
          },
          {
            id: "mock-2",
            title: `남북 문화 교류의 역사와 의의: ${payload.query} 관점`,
            snippet: "지난 수십 년간 이어져 온 남북 문화 교류의 역사적 흐름과 그 의의를 살펴보고 미래 전망을 제시...",
            source: "통일연구원",
            url: "https://example.com/unification-2",
            imageUrl: "https://picsum.photos/id/335/200/200",
            publishedDate: "2023-05-22T14:30:00Z"
          },
          {
            id: "mock-3",
            title: `통일 교육의 현재와 미래 방향성: ${payload.query} 중심으로`,
            snippet: "미래 세대를 위한 통일 교육의 현황과 개선 방향에 대한 교육 전문가들의 제언...",
            source: "교육부",
            url: "https://example.com/unification-3",
            imageUrl: "https://picsum.photos/id/453/200/200",
            publishedDate: "2023-06-10T11:15:00Z"
          },
        ]
      };
      
    case 'generate-quiz':
      return {
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
            question: `"${payload.content?.title || '통일교육'}"와 관련된 통일교육의 목표로 가장 적절한 것은?`,
            options: [
              "평화 의식 함양과 민주 시민 의식 고취",
              "북한 실상에 대한 객관적 이해 증진",
              "통일의 필요성 인식과 통일의지 함양",
              "반공 이데올로기 강화와 안보 의식 고취"
            ],
            correctAnswerIndex: 2,
            explanation: "통일교육은 통일의 필요성을 인식하고 통일에 대한 의지를 함양하는 것을 중요한 목표로 합니다."
          }
        ]
      };
      
    case 'summarize':
      return {
        summary: "한반도의 평화와 통일은 우리 민족의 오랜 염원이자 과제입니다. 분단 이후 남북한은 서로 다른 체제와 이념 속에서 발전해왔으며, 이로 인한 사회문화적 이질감도 심화되었습니다. 그러나 평화와 공존, 그리고 상호 이해를 통해 단계적으로 통일을 이루어 나가는 것이 중요합니다. 통일 교육은 이러한 과정에서 미래 세대가 통일 한국의 주역으로 성장할 수 있도록 돕는 중요한 교육 과정입니다. 북한 사회와 문화에 대한 올바른 이해, 민주 시민 의식의 함양, 그리고 평화적 문제 해결 능력을 키우는 것이 통일 교육의 핵심 요소라 할 수 있습니다."
      };
      
    default:
      return null;
  }
}