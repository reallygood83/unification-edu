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

// Supabase 클라이언트 또는 모의 클라이언트 반환
export async function getSupabase(): Promise<SupabaseClient> {
  console.log('Supabase 클라이언트 요청됨');

  try {
    // 실제 Supabase 연결을 시도
    if (supabaseUrl && supabaseAnonKey && typeof window !== 'undefined') {
      try {
        // 동적 임포트 시도 - 더 강력한 오류 처리 추가
        const SupabaseModule = await Promise.resolve().then(() => import('@supabase/supabase-js')).catch(err => {
          console.warn('Supabase 모듈 임포트 실패, 모의 클라이언트 사용:', err.message);
          return null;
        });

        // 모듈 로드에 실패한 경우
        if (!SupabaseModule) {
          console.warn('Supabase 모듈을 찾을 수 없음, 모의 클라이언트 사용');
          return mockSupabaseClient;
        }

        try {
          // 클라이언트 생성을 별도의 try-catch로 분리
          const client = SupabaseModule.createClient(supabaseUrl, supabaseAnonKey);
          console.log('실제 Supabase 클라이언트 생성 성공');
          return client as unknown as SupabaseClient;
        } catch (clientError) {
          console.error('Supabase 클라이언트 생성 실패:', clientError);
          return mockSupabaseClient;
        }
      } catch (importError) {
        console.warn('Supabase 모듈 임포트 예상치 못한 오류, 모의 클라이언트 사용:', importError);
        return mockSupabaseClient;
      }
    }

    console.warn('Supabase 설정 정보 없음, 모의 클라이언트 사용');
    return mockSupabaseClient;
  } catch (error) {
    console.error('Supabase 초기화 오류:', error);
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