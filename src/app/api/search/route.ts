import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Perplexity API 키는 서버 측에서만 사용
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

    // 환경 변수 디버깅을 위한 로깅 (민감한 키 값은 마스킹)
    console.log('환경 변수 디버깅:', {
      hasKey: !!PERPLEXITY_API_KEY,
      keyLength: PERPLEXITY_API_KEY ? PERPLEXITY_API_KEY.length : 0,
      envKeys: Object.keys(process.env).filter(key =>
        key.includes('PERPLEXITY') || key.includes('API')
      )
    });

    if (!PERPLEXITY_API_KEY) {
      console.error('Perplexity API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        {
          error: 'API 키가 설정되지 않았습니다.',
          debug: {
            envKeys: Object.keys(process.env).filter(key =>
              key.includes('PERPLEXITY') || key.includes('API')
            )
          }
        },
        { status: 500 }
      );
    }

    console.log('Perplexity API 호출 시도:', { query });

    const response = await axios.post(
      'https://api.perplexity.ai/search',
      { query },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    // 상세 오류 로깅
    console.error('Perplexity API 검색 오류:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || '응답 데이터 없음',
      status: error.response?.status || '상태 코드 없음'
    });

    return NextResponse.json(
      {
        error: error.message || '검색 중 오류가 발생했습니다.',
        details: error.response?.data || null
      },
      { status: 500 }
    );
  }
}