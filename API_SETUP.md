# API 키 설정 가이드

이 프로젝트는 다음과 같은 외부 API 서비스를 사용합니다:

1. **Perplexity API** - 뉴스 및 콘텐츠 검색
2. **OpenAI API** - AI 퀴즈 생성

## 환경 변수 설정 방법

### 로컬 개발 환경

1. 프로젝트 루트에 `.env.local` 파일 생성
2. 다음 형식으로 API 키 추가:

```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### Vercel 배포 환경

1. Vercel 대시보드에서 프로젝트 선택
2. Settings > Environment Variables 메뉴로 이동
3. 다음 환경 변수 추가:
   - `PERPLEXITY_API_KEY`
   - `NEXT_PUBLIC_OPENAI_API_KEY`

## 주의사항

1. **환경 변수 이름** - 대소문자를 정확히 일치시켜야 합니다.
2. **값 형식** - API 키 값에 따옴표나 공백이 포함되어서는 안 됩니다.
3. **키 교체** - API 키가 노출되면 즉시 새 키로 교체해야 합니다.

## API 키 획득 방법

### Perplexity API 키
1. [Perplexity AI](https://www.perplexity.ai/) 계정 생성
2. API 섹션으로 이동하여 새 API 키 생성
3. 생성된 키를 환경 변수에 설정

### OpenAI API 키
1. [OpenAI 플랫폼](https://platform.openai.com/) 계정 생성
2. API 키 섹션으로 이동하여 새 API 키 생성
3. 생성된 키를 환경 변수에 설정

## 문제 해결

### API 키가 설정되지 않은 경우
- 환경 변수 파일이 올바르게 로드되는지 확인
- Vercel에서 환경 변수가 올바르게 설정되었는지 확인
- 재배포 후 변경사항이 적용되었는지 확인

### API 오류가 발생하는 경우
- API 키가 유효한지 확인
- API 사용량 제한에 도달했는지 확인
- 로그에서 상세 오류 메시지 확인