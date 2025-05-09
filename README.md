# 통일교육 퀴즈 애플리케이션

통일교육 관련 콘텐츠를 기반으로 퀴즈를 생성하고 학습할 수 있는 웹 애플리케이션입니다. Perplexity API로 최신 콘텐츠를 검색하고, OpenAI API를 통해 자동으로 퀴즈를 생성합니다.

## 주요 기능

### 교사용 기능
- Perplexity API를 활용한 통일교육 콘텐츠 검색
- OpenAI API를 통한 맞춤형 퀴즈 자동 생성
- 난이도 및 학년 수준 조절 가능
- 생성된 퀴즈 관리 및 공유

### 학생용 기능
- 생성된 퀴즈 풀기
- 퀴즈 결과 확인 및 오답 노트
- 5일 연속 퀴즈 완료 시 수료 인증서 발급
- 학습 진행 상황 추적

## 기술 스택

- **프레임워크**: Next.js 15
- **스타일링**: Tailwind CSS
- **API**: 
  - Perplexity API (콘텐츠 검색)
  - OpenAI API (퀴즈 생성)
- **데이터 저장**: LocalStorage (클라이언트 측)

## 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/사용자명/unification-edu.git
cd unification-edu
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음과 같이 API 키를 설정합니다:
```
NEXT_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 `http://localhost:3000` 접속

## 향후 개선 계획

- 서버 측 데이터베이스 구현 (사용자 및 퀴즈 데이터 영구 저장)
- 사용자 인증 시스템 추가
- 교사/학생 상호작용 기능 강화
- 다양한 퀴즈 유형 및 통계 분석 기능 추가

## 라이센스

ISC
