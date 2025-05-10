// 환경 변수 관리 및 유효성 검사 모듈

/**
 * 환경 변수 접근 및 유효성 검사 함수
 * @param key 환경 변수 키
 * @param defaultValue 기본값 (선택적)
 * @param required 필수 여부
 * @returns 환경 변수 값 또는 기본값
 */
export function getEnv(key: string, defaultValue: string = '', required: boolean = false): string {
  // 서버 사이드 환경 변수 접근
  const value = process.env[key] || defaultValue;
  
  // 클라이언트 사이드 환경 변수 접근 (NEXT_PUBLIC_ 접두사가 있는 경우)
  if (typeof window !== 'undefined' && key.startsWith('NEXT_PUBLIC_')) {
    const clientValue = process.env[key] || defaultValue;
    if (clientValue) return clientValue;
  }
  
  // 필수 환경 변수 검사
  if (required && !value) {
    // 개발 환경에서는 경고 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.error(`[환경 변수 오류] '${key}'는 필수 환경 변수입니다.`);
    }
  }
  
  return value;
}

/**
 * API 키 가져오기 (마스킹 처리 포함)
 * @param key 환경 변수 키
 * @returns API 키 값 또는 빈 문자열
 */
export function getApiKey(key: string): string {
  const value = getEnv(key);
  
  // 개발 환경에서 API 키 상태 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log(`API 키 '${key}' 상태:`, {
      isSet: !!value,
      length: value ? value.length : 0,
      prefix: value ? value.substring(0, 4) + '...' : '',
    });
  }
  
  return value;
}

// 주요 API 키 미리 로드
export const API_KEYS = {
  PERPLEXITY: getApiKey('PERPLEXITY_API_KEY'),
  OPENAI: getApiKey('NEXT_PUBLIC_OPENAI_API_KEY'),
};

// Supabase 설정
export const SUPABASE_CONFIG = {
  URL: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
};

// 환경 변수 유효성 검사 (서버에서만 실행)
if (typeof window === 'undefined') {
  // 필수 API 키 검사
  if (!API_KEYS.PERPLEXITY) {
    console.warn('⚠️ PERPLEXITY_API_KEY가 설정되지 않았습니다.');
  }

  if (!API_KEYS.OPENAI) {
    console.warn('⚠️ NEXT_PUBLIC_OPENAI_API_KEY가 설정되지 않았습니다.');
  }

  // Supabase 설정 검사
  if (!SUPABASE_CONFIG.URL) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  }

  if (!SUPABASE_CONFIG.ANON_KEY) {
    console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  }
}