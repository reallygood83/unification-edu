# Supabase 데이터베이스 설정 가이드

이 문서는 통일교육 퀴즈 플랫폼에서 Supabase 데이터베이스를 설정하는 방법에 대한 안내입니다.

## 1. Supabase 프로젝트 생성

1. [Supabase 웹사이트](https://supabase.com/)에 접속하여 계정 생성 또는 로그인
2. 새 프로젝트 생성하기:
   - 대시보드에서 "New Project" 버튼 클릭
   - 프로젝트 이름 설정 (예: `unification-edu`)
   - 무료 티어 선택
   - 가까운 리전 선택 (예: Tokyo)
   - 데이터베이스 비밀번호 설정 (나중에 필요하니 기록해두세요)
   - "Create new project" 클릭

## 2. 테이블 생성

프로젝트가 생성되면 Supabase 대시보드에서 다음 테이블을 생성해야 합니다:

### 2.1 quizzes 테이블

"Table Editor" > "Create a new table"에서 다음 정보로 테이블을 생성하세요:

| 필드명 | 타입 | 기본값 | 설명 |
|-------|-----|-------|------|
| id | uuid | uuid_generate_v4() | 기본 키 |
| title | text | - | 퀴즈 제목 |
| description | text | - | 퀴즈 설명 |
| category | text | - | 퀴즈 카테고리 |
| difficulty | text | - | 퀴즈 난이도 |
| created_at | timestamptz | now() | 생성 시간 |
| questions | jsonb | - | 퀴즈 문제 (JSON) |
| source_content | jsonb | - | 출처 정보 (JSON) |
| target_grade | text[] | - | 대상 학년 (배열) |

### 2.2 student_progress 테이블

"Table Editor" > "Create a new table"에서 다음 정보로 테이블을 생성하세요:

| 필드명 | 타입 | 기본값 | 설명 |
|-------|-----|-------|------|
| id | uuid | uuid_generate_v4() | 기본 키 |
| user_id | text | - | 학생 ID |
| streak_count | integer | 0 | 연속 학습 일수 |
| last_completed_date | date | - | 마지막 완료 날짜 |
| completed_days | integer | 0 | 총 완료 일수 |
| certificate_earned | boolean | false | 인증서 획득 여부 |
| quiz_attempts | jsonb | - | 퀴즈 시도 기록 (JSON) |

## 3. 환경 변수 설정

`.env.local` 파일에 다음과 같이 Supabase 연결 정보를 추가하세요:

```
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=<프로젝트 URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<익명 키>
```

위의 값들은 Supabase 대시보드의 "Settings" > "API" 섹션에서 찾을 수 있습니다.

## 4. 데이터베이스 스키마 변경 시 주의사항

나중에 데이터베이스 스키마를 변경해야 할 경우:

1. Supabase 대시보드의 "Table Editor"에서 직접 변경 가능
2. 테이블 구조 변경 시, 해당 변경사항을 `/src/lib/supabase.ts` 파일의 `Tables` 타입 정의에도 반영해야 함
3. 마이그레이션이 필요한 경우, 기존 데이터를 백업하고 새로운 스키마로 이전

## 5. 로컬 개발 환경 vs 배포 환경

- 로컬 개발 환경에서도 실제 Supabase 프로젝트에 연결됩니다.
- 별도의 개발/테스트 환경이 필요하면 Supabase에서 새 프로젝트를 생성하고 환경별로 다른 환경 변수를 설정하세요.
- Vercel에 배포할 때는 Vercel 대시보드의 환경 변수 설정에 Supabase 연결 정보를 추가해야 합니다.

## 6. 백업 시스템

* 현재 구현에서는 Supabase DB에 저장 실패 시 자동으로 로컬 스토리지에 저장됩니다.
* 로컬 스토리지와 DB의 동기화는 자동으로 이루어지지 않으므로, 필요시 추가적인 동기화 로직 구현을 고려하세요.
* 중요 데이터는 정기적으로 Supabase에서 백업을 받는 것이 좋습니다.

## 7. 문제해결

* 데이터베이스 연결 오류: 환경 변수가 올바르게 설정되었는지 확인하세요.
* CORS 오류: Supabase 프로젝트 설정에서 애플리케이션 도메인이 허용 목록에 있는지 확인하세요.
* 권한 오류: Row Level Security (RLS) 정책이 올바르게 설정되었는지 확인하세요.