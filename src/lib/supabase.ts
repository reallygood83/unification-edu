import { createClient, SupabaseClient as OriginalSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './env';

// 가독성을 위해 SupabaseClient 인터페이스를 내부 타입으로 대체
export type SupabaseClient = OriginalSupabaseClient;

// 환경 변수에서 Supabase URL과 API 키 로드
const supabaseUrl = SUPABASE_CONFIG.URL;
const supabaseAnonKey = SUPABASE_CONFIG.ANON_KEY;

// 새로운 목 클라이언트 생성 함수
function createMockClient(): SupabaseClient {
  // 실제 SupabaseClient 인터페이스를 모킹하는 객체
  // 경고: 이 모킹은 완벽하지 않으며 필요한 메서드만 구현합니다
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: '모의 Supabase 클라이언트: 실제 DB 연결 없음' } }),
          maybeSingle: async () => ({ data: null, error: { message: '모의 Supabase 클라이언트: 실제 DB 연결 없음' } }),
        }),
        order: () => ({
          data: [],
          error: { message: '모의 Supabase 클라이언트: 실제 DB 연결 없음' }
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: { id: `mock-${Date.now()}` },
            error: null
          }),
        }),
      }),
      update: () => ({
        eq: async () => ({
          data: null,
          error: { message: '모의 Supabase 클라이언트: 실제 DB 연결 없음' }
        }),
      }),
    }),
    // 필요한 다른 메서드들을 여기에 추가
  } as unknown as SupabaseClient;
}

// 이미 생성된 Supabase 클라이언트 인스턴스를 저장하기 위한 전역 변수
let supabaseClientInstance: any = null;

/**
 * Supabase 클라이언트 반환 - 간소화된 구현
 */
export async function getSupabase(): Promise<SupabaseClient> {
  console.log('Supabase 클라이언트 요청됨');

  // 이미 생성된 인스턴스가 있으면 재사용
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  try {
    // URL과 API 키 확인
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase URL 또는 API 키가 설정되지 않았습니다.');
      console.warn('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수를 확인하세요.');
      console.warn('현재 값: URL=' + (supabaseUrl ? '설정됨' : '없음') +
                  ', KEY=' + (supabaseAnonKey ? '설정됨' : '없음'));

      const mockClient = createMockClient();
      supabaseClientInstance = mockClient;
      return mockClient;
    }

    try {
      // 실제 Supabase 클라이언트 생성
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // 테이블 접근 테스트
      try {
        // 실제 테이블 접근 테스트
        const { data, error } = await client
          .from('quizzes')
          .select('id')
          .limit(1);

        if (error) {
          console.warn('Supabase 테이블 접근 테스트 실패:', error.message);

          // 테이블 스키마 문제인지 확인
          if (error.message.includes('does not exist') ||
              error.message.includes('schema cache') ||
              error.message.includes('column')) {
            console.error('테이블 스키마 오류: src/lib/supabase-setup.sql 파일의 SQL을 Supabase SQL 편집기에서 실행하세요.');
          }

          // 접근 권한 문제인지 확인
          if (error.message.includes('permission') || error.message.includes('policy')) {
            console.error('테이블 접근 권한 오류: RLS 정책을 확인하세요.');
          }

          const mockClient = createMockClient();
          supabaseClientInstance = mockClient;
          return mockClient;
        }

        console.log('Supabase 연결 및 테이블 접근 테스트 성공!');
        console.log('데이터:', data || '없음');

        supabaseClientInstance = client;
        return client;
      } catch (testError) {
        console.error('테이블 접근 테스트 중 오류:', testError);
        const mockClient = createMockClient();
        supabaseClientInstance = mockClient;
        return mockClient;
      }
    } catch (clientError) {
      console.error('Supabase 클라이언트 생성 실패:', clientError);
      const mockClient = createMockClient();
      supabaseClientInstance = mockClient;
      return mockClient;
    }
  } catch (error) {
    console.error('Supabase 초기화 오류:', error);
    const mockClient = createMockClient();
    supabaseClientInstance = mockClient;
    return mockClient;
  }
}

// 기존 방식과의 호환성을 위한 객체
export const supabase = createMockClient();

// 타입 안전성을 위한 테이블 타입 정의
export type Tables = {
  quizzes: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    created_at: string;
    questions: any[]; // JSON 형태로 저장됨
    source_content: any; // JSON 형태로 저장됨
    target_grade: string[];
  };
  student_progress: {
    id: string;
    user_id: string;
    streak_count: number;
    last_completed_date: string;
    completed_days: number;
    certificate_earned: boolean;
    quiz_attempts: any[]; // JSON 형태로 저장됨
  };
};