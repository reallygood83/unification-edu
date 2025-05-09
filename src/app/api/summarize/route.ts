import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    // Perplexity API 키는 서버 측에서만 사용
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';
    
    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }
    
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
    console.error('Perplexity API 요약 오류:', error);
    return NextResponse.json(
      { error: error.message || '요약 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}