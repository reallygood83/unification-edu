import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 API 키 로드
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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