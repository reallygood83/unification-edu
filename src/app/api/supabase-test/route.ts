import { NextResponse } from 'next/server';
import { runSupabaseDiagnostics } from '@/lib/supabase-test';
import { SUPABASE_CONFIG } from '@/lib/env';

/**
 * Supabase 진단 API 라우트
 * 클라이언트에서 Supabase 연결과 설정 상태를 확인할 수 있는 진단 정보 제공
 */
export async function GET() {
  try {
    // 환경 변수 설정 여부 확인
    const configStatus = {
      url: !!SUPABASE_CONFIG.URL,
      anonKey: !!SUPABASE_CONFIG.ANON_KEY,
      urlPrefix: SUPABASE_CONFIG.URL ? SUPABASE_CONFIG.URL.substring(0, 15) + '...' : 'not set',
      keyPrefix: SUPABASE_CONFIG.ANON_KEY ? SUPABASE_CONFIG.ANON_KEY.substring(0, 5) + '...' : 'not set'
    };
    
    // 진단 실행
    const diagnosticResults = await runSupabaseDiagnostics();
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      configStatus,
      diagnosticResults,
      success: diagnosticResults.overallSuccess
    });
  } catch (error) {
    console.error('Supabase 진단 API 오류:', error);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Supabase 진단 중 오류가 발생했습니다.',
      errorDetails: error instanceof Error ? error.message : String(error),
      success: false
    }, { status: 500 });
  }
}