# Supabase 데이터베이스 전체 설정 가이드

이 가이드는 통일교육 퀴즈 애플리케이션을 위한 Supabase 데이터베이스를 처음부터 완벽하게 설정하는 방법을 단계별로 안내합니다.

## 1. Supabase 계정 및 프로젝트 생성

1. [Supabase 웹사이트](https://supabase.com/)에 접속하여 계정 생성 또는 로그인
2. 새 프로젝트 생성하기:
   - 대시보드에서 "New Project" 버튼 클릭
   - 프로젝트 이름 설정 (예: `unification-edu`)
   - 무료 티어 선택
   - 가까운 리전 선택 (예: Tokyo)
   - 데이터베이스 비밀번호 설정 (나중에 필요하니 기록해두세요)
   - "Create new project" 클릭하고 프로젝트 생성 완료될 때까지 대기 (약 2-3분 소요)

## 2. 데이터베이스 테이블 설정

### 2.1 SQL 편집기로 테이블 생성

1. Supabase 대시보드에서 좌측 메뉴의 "SQL Editor" 클릭
2. "New Query" 버튼 클릭하여 새 SQL 쿼리 작성
3. 다음 SQL 코드를 복사하여 붙여넣기:

```sql
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
```

4. "Run" 버튼을 클릭하여 SQL 쿼리 실행
5. 정상적으로 실행되면 "Success. No rows returned." 메시지 확인

### 2.2 테이블 확인

1. 좌측 메뉴에서 "Table Editor" 클릭
2. 방금 생성한 `quizzes`와 `student_progress` 테이블이 목록에 표시되는지 확인
3. 각 테이블을 클릭하여 정의한 컬럼 구조가 올바르게 생성되었는지 확인

## 3. 환경 변수 설정

### 3.1 Supabase API 키 및 URL 확인

1. Supabase 대시보드에서 좌측 메뉴의 "Settings" > "API" 클릭
2. "Project URL"과 "Project API keys" 섹션 확인
3. `anon` `public` 키와 URL을 복사 (이 정보는 환경 변수에 사용됨)

### 3.2 환경 변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용 추가:

```
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL (2.1에서 복사한 URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public 키 (2.1에서 복사한 키)

## 4. 애플리케이션 실행 및 확인

1. 프로젝트 루트 디렉토리에서 애플리케이션 실행:
   ```
   npm run dev
   ```

2. 웹 브라우저에서 `http://localhost:3000` 접속

3. 다음 기능을 테스트하여 Supabase 연결이 정상적으로 작동하는지 확인:
   - 새 퀴즈 생성
   - 퀴즈 목록 조회
   - 퀴즈 상세 정보 보기

4. 개발자 콘솔(F12)에서 다음 메시지 확인:
   - "Supabase 연결 및 테이블 접근 테스트 성공!" (정상 연결 시)
   - "Supabase에 퀴즈가 성공적으로 저장됨" (퀴즈 저장 성공 시)

## 5. 배포 환경 설정 (Vercel)

Vercel에 배포할 경우, 환경 변수를 Vercel 대시보드에도 설정해야 합니다:

1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" > "Environment Variables" 클릭
3. 다음 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. "Save" 버튼 클릭
5. 프로젝트 재배포

## 6. 문제 해결

### 연결 오류 진단

만약 "데이터베이스 연결 오류" 또는 "테이블 스키마 오류"가 발생한다면:

1. 환경 변수가 올바르게 설정되었는지 확인:
   - `.env.local` 파일의 URL과 키가 정확한지 확인
   - 오타나 공백 문자가 없는지 확인

2. SQL 쿼리가 성공적으로 실행되었는지 확인:
   - Supabase 대시보드의 "Table Editor"에서 테이블 확인
   - 컬럼 이름과 타입이 SQL 쿼리와 일치하는지 확인

3. 애플리케이션 재시작:
   - 환경 변수 변경 후 Next.js 개발 서버 재시작

4. Supabase 테이블 권한 확인:
   - RLS(Row Level Security) 정책이 올바르게 설정되었는지 확인

### 일반적인 오류 메시지 해석

1. **"Supabase URL 또는 API 키가 설정되지 않았습니다"**
   - 환경 변수가 누락되었거나 잘못 설정됨
   - `.env.local` 파일이 프로젝트 루트에 있는지 확인

2. **"테이블 스키마 오류: src/lib/supabase-setup.sql 파일의 SQL을 Supabase SQL 편집기에서 실행하세요"**
   - SQL 쿼리를 실행하지 않았거나 실패함
   - Supabase 대시보드의 SQL 편집기에서 쿼리 재실행

3. **"does not exist"** 또는 **"column ... of relation ... does not exist"**
   - 테이블이나 컬럼이 존재하지 않음
   - SQL 쿼리가 올바르게 실행되었는지 확인

## 7. 데이터 백업 및 복원

Supabase에 저장된 데이터는 정기적으로 백업하는 것이 좋습니다:

1. Supabase 대시보드에서 "Database" > "Backups" 클릭
2. "Download" 버튼을 클릭하여 데이터베이스 백업 다운로드
3. 백업 파일을 안전한 위치에 보관

## 8. 추가 자료

- [Supabase 공식 문서](https://supabase.io/docs)
- [Row Level Security 가이드](https://supabase.io/docs/guides/auth/row-level-security)
- [Next.js + Supabase 통합 가이드](https://supabase.io/docs/guides/with-nextjs)