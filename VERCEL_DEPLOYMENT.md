# Vercel 배포 가이드

이 문서는 통일교육 퀴즈 애플리케이션을 Vercel에 배포하는 방법과 Supabase 연결에 관한 문제 해결 방법을 안내합니다.

## 1. Vercel 배포 준비

### 1.1 GitHub 저장소 설정

1. 애플리케이션 코드를 GitHub 저장소에 푸시합니다.
2. 모든 변경사항이 완료되었는지 확인합니다.

### 1.2 package.json 확인

다음 패키지가 `dependencies`에 포함되어 있는지 확인합니다:

```json
"dependencies": {
  "@supabase/supabase-js": "^2.x.x",
  "next": "14.x.x",
  "react": "18.x.x",
  "react-dom": "18.x.x"
}
```

## 2. Vercel 배포 과정

1. [Vercel 대시보드](https://vercel.com)에 로그인합니다.
2. "New Project" 버튼을 클릭합니다.
3. GitHub 저장소를 선택합니다.
4. "Import" 버튼을 클릭합니다.
5. 프로젝트 설정 페이지에서 다음 환경 변수를 추가합니다:

| 환경 변수 이름 | 값 | 설명 |
|--------------|-----|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `your_supabase_url` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Supabase 익명 키 |

6. "Deploy" 버튼을 클릭하여 배포를 시작합니다.

## 3. 배포 후 문제 해결

### 3.1 "Supabase 모듈 임포트 실패" 오류

이 오류는 Vercel 배포 환경에서 Supabase 모듈을 동적으로 임포트할 때 발생할 수 있습니다.

#### 해결 방법:

1. **환경 변수 확인**:
   - Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인합니다.

2. **Node.js 버전 확인**:
   - Vercel 프로젝트 설정에서 Node.js 버전이 16 이상인지 확인합니다.
   - 설정 > General > Node.js Version에서 확인 가능합니다.

3. **애플리케이션 빌드 설정**:
   - Vercel의 Build & Development Settings에서 다음 설정을 확인합니다:
     - Build Command: `next build`
     - Output Directory: `.next`

4. **캐시 무효화**:
   - Vercel 대시보드에서 "Deployments" 탭으로 이동합니다.
   - 최신 배포를 선택하고 "Redeploy" 옵션에서 "Clear Cache and Deploy"를 선택합니다.

### 3.2 "Cannot read properties of undefined (reading 'length')" 오류

이 오류는 보통 데이터가 예상한 형식이 아닐 때 발생합니다.

#### 해결 방법:

1. **코드에서 null 체크 추가**:
   - 모든 배열 및 객체 접근에 null 체크를 추가합니다.
   - 예시: `questions?.length || 0` 또는 `Array.isArray(data) ? data : []`

2. **문제 영역 식별**:
   - 브라우저 콘솔에서 어떤 컴포넌트에서 오류가 발생하는지 확인합니다.
   - 해당 컴포넌트에서 모든 데이터 접근에 안전 처리를 추가합니다.

3. **수동 배포 테스트**:
   - 로컬 환경에서 `next build` 및 `next start` 명령으로 배포 환경을 시뮬레이션합니다.
   - 오류가 발생하면 로컬에서 먼저 수정합니다.

## 4. Supabase와 Vercel 통합 최적화

### 4.1 Vercel Edge Functions과 Supabase

Vercel Edge Functions을 사용하는 경우 다음과 같이 Supabase 클라이언트를 초기화하는 것이 좋습니다:

```typescript
export async function getSupabase() {
  if (!globalThis.supabase) {
    // 동적 임포트
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    globalThis.supabase = supabase;
  }
  return globalThis.supabase;
}
```

### 4.2 서버리스 환경에 대한 설정

Vercel 서버리스 환경에서는 연결 풀링을 최적화하는 것이 좋습니다:

```typescript
// utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 서버리스 환경에 최적화된 옵션
const options = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, options)

export default supabase
```

## 5. 배포 성공 후 점검 사항

1. **기본 기능 테스트**:
   - 홈페이지가 제대로 로드되는지 확인
   - 퀴즈 생성 및 공유 기능 테스트
   - 학생 퀴즈 풀기 기능 테스트

2. **DB 연결 확인**:
   - 퀴즈 데이터가 Supabase에 저장되는지 확인
   - Supabase 대시보드에서 새 레코드 확인

3. **로그 확인**:
   - Vercel 대시보드의 "Logs" 탭에서 오류 확인
   - 브라우저 콘솔에서 클라이언트 측 오류 확인

## 6. 자주 발생하는 문제와 해결 방법

### 6.1 CORS 오류

Supabase API 요청 시 CORS 오류가 발생하는 경우:

1. Supabase 대시보드에서 "Authentication" > "URL Configuration"으로 이동
2. "Site URL"에 Vercel 배포 URL 추가 (예: `https://your-app.vercel.app`)
3. "Additional Redirect URLs"에도 동일한 URL 추가

### 6.2 환경 변수 문제

환경 변수가 제대로 로드되지 않는 경우:

1. Vercel 대시보드에서 환경 변수가 정확히 설정되었는지 확인
2. 프로덕션, 프리뷰, 개발 환경에 모두 적용되었는지 확인
3. 재배포 후 환경 변수 값이 적용되었는지 확인

### 6.3 타입스크립트 빌드 오류

타입스크립트 관련 빌드 오류가 발생하는 경우:

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "noEmit": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

또는 `next.config.js`에 다음 설정 추가:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...
  typescript: {
    ignoreBuildErrors: true,
  },
}
```

## 7. 배포 자동화

GitHub 저장소와 Vercel을 연결하면 코드가 푸시될 때마다 자동으로 배포됩니다.

1. GitHub Actions 워크플로우 설정:
   - `.github/workflows/deploy.yml` 파일 생성
   - Vercel 배포 워크플로우 설정
   - 환경 변수를 GitHub Secrets에 추가

2. 배포 미리보기:
   - 각 Pull Request에 대한 미리보기 배포 활성화
   - Vercel 대시보드에서 "Git Integration" 설정에서 활성화

## 도움이 필요하신가요?

문제가 지속되는 경우 다음 리소스를 참조하세요:

- [Vercel 공식 문서](https://vercel.com/docs)
- [Supabase 공식 문서](https://supabase.io/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)