import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* 헤더 섹션 */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-primary">통일</span>교육 <span className="text-secondary">퀴즈</span> 플랫폼
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            통일교육 콘텐츠를 기반으로 퀴즈를 생성하고 학습하는 지능형 교육 플랫폼입니다.
            Perplexity API로 최신 콘텐츠를 검색하고 AI가 맞춤형 퀴즈를 생성해줍니다.
          </p>
        </header>

        {/* 주요 기능 하이라이트 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">지능형 콘텐츠 검색</h3>
            <p className="text-gray-600">
              Perplexity API를 활용해 통일교육 관련 최신 뉴스, 아티클, 유튜브 영상 등 다양한 콘텐츠를 검색하고 활용할 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI 퀴즈 생성</h3>
            <p className="text-gray-600">
              선택한 콘텐츠를 바탕으로 OpenAI가 자동으로 최적화된 객관식 퀴즈를 생성합니다. 난이도와 학년 수준을 조절할 수 있습니다.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">학습 인증 시스템</h3>
            <p className="text-gray-600">
              5일 연속으로 퀴즈를 완료한 학생들에게 통일교육 수료 인증서를 자동으로 발급합니다. 학습 진행 상황을 추적할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 사용자 역할 선택 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Link href="/teacher" className="group block">
            <div className="relative h-full overflow-hidden bg-white rounded-xl shadow hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <div className="p-8">
                <div className="flex items-start mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 group-hover:text-primary transition-colors">교사용 플랫폼</h2>
                    <p className="text-gray-500 mt-1">콘텐츠 검색 및 퀴즈 생성</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  원하는 통일교육 주제를 선택하고 최신 콘텐츠를 검색해보세요. AI가 선택한 콘텐츠를 바탕으로 학생들에게 최적화된 맞춤형 퀴즈를 자동으로 생성해줍니다.
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Perplexity API로 최신 통일교육 콘텐츠 검색
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    난이도와 학년 수준 맞춤 설정
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    AI 기반 자동 퀴즈 생성 및 관리
                  </li>
                </ul>

                <div className="flex justify-end">
                  <span className="inline-flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform">
                    교사용 페이지로 이동
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/student" className="group block">
            <div className="relative h-full overflow-hidden bg-white rounded-xl shadow hover:shadow-md transition-all duration-300 border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
              <div className="p-8">
                <div className="flex items-start mb-6">
                  <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 group-hover:text-secondary transition-colors">학생용 플랫폼</h2>
                    <p className="text-gray-500 mt-1">퀴즈 풀이 및 인증서 획득</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  교사가 생성한 통일교육 퀴즈에 참여하고 지식을 쌓아보세요. 5일 연속으로 퀴즈를 완료하면 통일교육 수료 인증서를 획득할 수 있습니다.
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    다양한 통일교육 주제 퀴즈 참여
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    학습 진행 상황 및 정답률 확인
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-secondary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    5일 연속 완료 시 인증서 자동 발급
                  </li>
                </ul>

                <div className="flex justify-end">
                  <span className="inline-flex items-center text-secondary font-medium group-hover:translate-x-1 transition-transform">
                    학생용 페이지로 이동
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* 푸터 */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-gray-500">© 2025 통일교육 퀴즈 플랫폼 | 한반도 평화와 통일을 위한 교육 프로젝트</p>
        </footer>
      </div>
    </div>
  );
}
