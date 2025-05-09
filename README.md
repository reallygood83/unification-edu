# 통일교육 퀴즈 웹 애플리케이션

학생들이 통일교육을 재미있게 학습할 수 있는 퀴즈 애플리케이션입니다.

## 프로젝트 개요

통일교육 퀴즈 웹 애플리케이션은 교사가 통일교육 카테고리를 선택하면 관련 뉴스/동영상을 추천해주고, 선택한 콘텐츠를 기반으로 AI가 퀴즈를 자동 생성하는 웹 애플리케이션입니다. 학생들이 5일 연속으로 퀴즈를 완료하면 통일 관련 인증서를 획득할 수 있습니다.

## 기술 스택

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API (퀴즈 생성)
- NewsAPI 또는 유사한 뉴스 API
- YouTube Data API
- localStorage (구현체 용으로 사용)
- Vercel 배포 예정

## 주요 기능

1. 교사용 카테고리 선택 (통일 교육 주제) 및 학년 필터
2. 선택한 카테고리 기반 뉴스/YouTube 콘텐츠 추천
3. 선택한 콘텐츠 기반 5문항 퀴즈 자동 생성 (OpenAI API)
4. 학생용 퀴즈 인터페이스 및 채점 시스템
5. 5일 연속 완료 추적 및 인증서 생성

## 시작하기

```bash
# 레파지토리 복제
git clone https://github.com/yourusername/unification-quiz-app.git

# 프로젝트 폴더로 이동
cd unification-quiz-app

# 라이브러리 설치
npm install

# 환경 변수 파일 설정
# .env.local 파일을 생성하고 아래 변수를 설정해주세요
# OPENAI_API_KEY=your_openai_api_key
# NEWS_API_KEY=your_news_api_key
# YOUTUBE_API_KEY=your_youtube_api_key

# 로컬 서버 실행
npm run dev
```

## 구조

```
/src
  /app                    # Next.js App Router 페이지
    /layout.tsx           # 루트 레이아웃
    /page.tsx             # 홈페이지
    /teacher              # 교사용 페이지
      /page.tsx           # 교사용 대시보드
      /content/[category] # 카테고리별 콘텐츠 선택 페이지
      /quiz/create        # 퀴즈 생성 페이지
    /student              # 학생용 페이지
      /page.tsx           # 학생용 대시보드
      /quiz/[id]          # 퀴즈 페이지
      /certificate        # 인증서 페이지
  /components             # 재사용 컴포넌트
  /lib                    # 유틸리티 함수
    /data.ts              # 카테고리 데이터
    /mock-data.ts         # 목업 데이터
    /quiz-generator.ts    # 퀴즈 생성 로직
  /styles                 # 스타일
    /globals.css          # 글로벌 스타일
  /types                  # 타입 정의
    /index.ts             # 타입 정의
```

## 프로덕션 로직

- 실제 구현에서는 Vercel KV 또는 다른 데이터베이스를 사용하여 데이터를 저장하는 것이 좋습니다.
- NewsAPI, YouTube API를 사용하여 실제 최신 콘텐츠를 가져오도록 구현해야 합니다.
- 퀴즈 자동 생성을 위해 OpenAI API를 사용합니다.
