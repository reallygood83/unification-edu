import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { API_KEYS } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    // Perplexity API 키 가져오기 (env.ts에서 로드)
    const PERPLEXITY_API_KEY = API_KEYS.PERPLEXITY;

    // 실행 환경 및 환경 변수 확인을 위한 로깅
    console.log('API 요청 환경 정보:', {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
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
          suggestions: [
            'Vercel 프로젝트 설정에서 PERPLEXITY_API_KEY 환경 변수를 확인하세요.',
            '환경 변수 이름이 정확히 일치하는지 확인하세요. (대소문자 구분)',
            'API 키 값에 따옴표나 공백이 포함되어 있지 않은지 확인하세요.'
          ],
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

    console.log('Perplexity API 요청 정보:', {
      url: 'https://api.perplexity.ai/search',
      payload: { query },
      headers: {
        // 키는 마스킹 처리
        'Authorization': `Bearer ${PERPLEXITY_API_KEY ? 'XXXX-XXXX-XXXX' : 'MISSING_KEY'}`,
        'Content-Type': 'application/json'
      }
    });

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
      status: error.response?.status || '상태 코드 없음',
      headers: error.response?.headers || '헤더 정보 없음',
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout
      }
    });

    // API 키 문제 여부 확인
    let statusCode = 500;
    let errorMessage = error.message || '검색 중 오류가 발생했습니다.';

    if (error.response?.status === 401 || error.response?.status === 403) {
      statusCode = error.response.status;
      errorMessage = 'API 키가 유효하지 않거나 권한이 없습니다. 관리자에게 문의하세요.';
    } else if (error.response?.status === 429) {
      statusCode = 429;
      errorMessage = 'API 사용량 제한에 도달했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'API 서버 연결 시간이 초과되었습니다. 네트워크 상태를 확인하세요.';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data || null
        }
      },
      { status: statusCode }
    );
  }
}