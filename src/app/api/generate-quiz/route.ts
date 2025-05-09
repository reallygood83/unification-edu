import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { content, category, difficulty, questionCount } = await request.json();
    
    // 서버 측 환경 변수에서 API 키 가져오기
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { 
          error: 'OpenAI API 키가 설정되지 않았습니다.',
          suggestions: [
            'Vercel 프로젝트 설정에서 OPENAI_API_KEY 환경 변수를 확인하세요.',
            '환경 변수 이름이 정확히 일치하는지 확인하세요. (대소문자 구분)',
            'API 키 값에 따옴표나 공백이 포함되어 있지 않은지 확인하세요.'
          ]
        },
        { status: 500 }
      );
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
          throw new Error(`모든 OpenAI 모델 시도 실패: ${error.message}`);
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
    
    return NextResponse.json(
      { 
        error: error.message || '퀴즈 생성 중 오류가 발생했습니다.',
        details: error.stack
      },
      { status: 500 }
    );
  }
}