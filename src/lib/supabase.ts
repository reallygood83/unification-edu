// 동적 임포트를 위한 타입
import type { SupabaseClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 API 키 로드
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성 (동적 임포트 사용)
let _supabase: SupabaseClient | null = null;

export async function getSupabase(): Promise<SupabaseClient | null> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not provided');
      return null;
    }

    if (_supabase) return _supabase;

    // 동적 임포트로 라이브러리 로드
    const { createClient } = await import('@supabase/supabase-js');
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
    return _supabase;
  } catch (error) {
    console.error('Supabase initialization error:', error);
    return null;
  }
}

// 기존 방식과 호환성 유지를 위한 빈 객체 (타입 캐스팅)
export const supabase = {} as SupabaseClient;

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