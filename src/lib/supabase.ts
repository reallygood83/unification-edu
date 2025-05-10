// 타입 정의를 위한 인터페이스
export interface SupabaseClient {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: any) => {
        single: () => Promise<any>;
        maybeSingle: () => Promise<any>;
      };
      order: (column: string, options: { ascending: boolean }) => Promise<any>;
    };
    insert: (data: any[]) => {
      select: (columns: string) => {
        single: () => Promise<any>;
      };
    };
    update: (data: any) => {
      eq: (column: string, value: any) => Promise<any>;
    };
  };
}

// 환경 변수에서 Supabase URL과 API 키 로드
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 모의 클라이언트 (실제 DB 작업을 수행하지 않음)
const mockSupabaseClient: SupabaseClient = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: { message: '모의 Supabase 클라이언트: 실제 DB 연결 없음' } }),
        maybeSingle: async () => ({ data: null, error: { message: '모의 Supabase 클라이언트: 실제 DB 연결 없음' } }),
      }),
      order: async (column: string, options: { ascending: boolean }) => ({
        data: [],
        error: { message: '모의 Supabase 클라이언트: 실제 DB 연결 없음' }
      }),
    }),
    insert: (data: any[]) => ({
      select: (columns: string) => ({
        single: async () => ({
          data: { id: `mock-${Date.now()}` },
          error: null
        }),
      }),
    }),
    update: (data: any) => ({
      eq: async (column: string, value: any) => ({
        data: null,
        error: { message: '모의 Supabase 클라이언트: 실제 DB 연결 없음' }
      }),
    }),
  }),
};

// 이미 생성된 Supabase 클라이언트 인스턴스를 저장하기 위한 전역 변수
let supabaseClientInstance: any = null;

// Supabase 클라이언트 또는 모의 클라이언트 반환
export async function getSupabase(): Promise<SupabaseClient> {
  console.log('Supabase 클라이언트 요청됨');

  // 이미 생성된 인스턴스가 있으면 재사용
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  try {
    // 실제 Supabase 연결을 시도
    if (supabaseUrl && supabaseAnonKey) {
      try {
        // 정적 임포트 대신 필요한 함수만 직접 임포트 시도
        let createClient;

        // Next.js 서버 환경과 클라이언트 환경 모두 지원
        try {
          // CommonJS 방식 시도
          const SupabaseModule = require('@supabase/supabase-js');
          createClient = SupabaseModule.createClient;
          console.log('CommonJS를 통해 Supabase 모듈 로드 성공');
        } catch (commonjsError) {
          try {
            // ESM 방식 시도 (동적 임포트)
            console.log('ESM 방식으로 Supabase 모듈 임포트 시도');
            const SupabaseModule = await import('@supabase/supabase-js');
            createClient = SupabaseModule.createClient;
            console.log('ESM을 통해 Supabase 모듈 로드 성공');
          } catch (esmError) {
            console.warn('모든 Supabase 모듈 임포트 방식 실패, 모의 클라이언트 사용');
            supabaseClientInstance = mockSupabaseClient;
            return mockSupabaseClient;
          }
        }

        if (!createClient) {
          console.warn('createClient 함수를 찾을 수 없음, 모의 클라이언트 사용');
          supabaseClientInstance = mockSupabaseClient;
          return mockSupabaseClient;
        }

        try {
          // 클라이언트 생성을 별도의 try-catch로 분리
          const client = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          });
          console.log('실제 Supabase 클라이언트 생성 성공');
          supabaseClientInstance = client as unknown as SupabaseClient;
          return supabaseClientInstance;
        } catch (clientError) {
          console.error('Supabase 클라이언트 생성 실패:', clientError);
          supabaseClientInstance = mockSupabaseClient;
          return mockSupabaseClient;
        }
      } catch (importError) {
        console.warn('Supabase 모듈 임포트 예상치 못한 오류, 모의 클라이언트 사용:', importError);
        supabaseClientInstance = mockSupabaseClient;
        return mockSupabaseClient;
      }
    }

    console.warn('Supabase 설정 정보 없음, 모의 클라이언트 사용');
    supabaseClientInstance = mockSupabaseClient;
    return mockSupabaseClient;
  } catch (error) {
    console.error('Supabase 초기화 오류:', error);
    supabaseClientInstance = mockSupabaseClient;
    return mockSupabaseClient;
  }
}

// 기존 방식과의 호환성을 위한 객체
export const supabase = mockSupabaseClient;

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