import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // Perplexity API 키는 서버 측에서만 사용
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

    if (!PERPLEXITY_API_KEY) {
      console.error('Perplexity API 키가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    console.log('Perplexity API 요약 호출 시도:', { url });

    const response = await axios.post(
      'https://api.perplexity.ai/summarize',
      { url },
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
    console.error('Perplexity API 요약 오류:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || '응답 데이터 없음',
      status: error.response?.status || '상태 코드 없음'
    });

    return NextResponse.json(
      {
        error: error.message || '요약 중 오류가 발생했습니다.',
        details: error.response?.data || null
      },
      { status: 500 }
    );
  }
}