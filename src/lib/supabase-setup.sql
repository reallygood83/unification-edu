-- 기존 테이블이 있다면 삭제
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS student_progress;

-- 익스텐션 활성화 (UUID 생성 함수를 위함)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- quizzes 테이블 생성 (정확한 컬럼명과 타입으로)
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  questions JSONB NOT NULL,
  source_content JSONB,
  target_grade TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- student_progress 테이블 생성
CREATE TABLE student_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  streak_count INTEGER DEFAULT 0,
  last_completed_date TEXT,
  completed_days INTEGER DEFAULT 0,
  certificate_earned BOOLEAN DEFAULT FALSE,
  quiz_attempts JSONB DEFAULT '[]'::jsonb
);

-- 인덱스 생성
CREATE INDEX idx_quizzes_category ON quizzes(category);
CREATE INDEX idx_student_progress_user_id ON student_progress(user_id);

-- 테이블 권한 설정
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- 익명 접근을 위한 정책 (실제 환경에서는 더 제한적으로 설정 필요)
CREATE POLICY "모든 사용자가 퀴즈를 읽을 수 있음" 
  ON quizzes FOR SELECT USING (true);

CREATE POLICY "모든 사용자가 퀴즈를 추가할 수 있음" 
  ON quizzes FOR INSERT WITH CHECK (true);

CREATE POLICY "모든 사용자가 학생 진행 상황을 읽을 수 있음" 
  ON student_progress FOR SELECT USING (true);

CREATE POLICY "모든 사용자가 학생 진행 상황을 추가/수정할 수 있음" 
  ON student_progress FOR INSERT WITH CHECK (true);

CREATE POLICY "모든 사용자가 학생 진행 상황을 업데이트할 수 있음" 
  ON student_progress FOR UPDATE USING (true);