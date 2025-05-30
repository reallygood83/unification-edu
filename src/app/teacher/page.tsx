"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { unificationCategories, gradeLevels, difficultyLevels } from '@/lib/data';
import { Content, GradeLevel, Category } from '@/types';
import { searchContents } from '@/lib/openai-client';

export default function TeacherPage() {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filter categories based on selected grade level
  const filteredCategories = selectedGrade === 'all'
    ? unificationCategories
    : unificationCategories.filter(category => 
        category.gradeLevel.includes(selectedGrade as GradeLevel)
      );

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    // 카테고리 키워드를 사용하여 기본 검색어 설정 (자동 검색 실행 없음)
    setSearchQuery(category.keywords[0]);
  };

  // 선택된 카테고리의 주요 학년 수준 가져오기
  const getTargetGradeFromCategory = (): string => {
    if (!selectedCategory) return 'middle'; // 기본값

    // 카테고리의 학년 수준 중에서 가장 낮은 학년 선택 (가장 쉬운 콘텐츠 먼저)
    if (selectedCategory.gradeLevel.includes('elementary')) {
      return 'elementary';
    } else if (selectedCategory.gradeLevel.includes('middle')) {
      return 'middle';
    } else if (selectedCategory.gradeLevel.includes('high')) {
      return 'high';
    }

    return 'middle'; // 기본값
  };

  // 콘텐츠 검색 핸들러
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    try {
      setIsSearching(true);
      setError(null);
      setSearchResults([]); // 이전 검색 결과 초기화

      // 카테고리 학년 수준에 맞는 검색
      const targetGrade = getTargetGradeFromCategory();
      console.log('검색 시작 - 검색어:', searchQuery, '대상 학년:', targetGrade);

      // API를 통해 콘텐츠 검색 (학년 수준 전달)
      try {
        const results = await searchContents(searchQuery, targetGrade);
        console.log('검색 결과 수신:', results.length, '개 항목');

        if (results.length === 0) {
          setError('검색 결과가 없습니다. 다른 검색어를 시도해보세요.');
        } else {
          // 검색 결과를 세션 스토리지에 저장 (퀴즈 생성 페이지에서 사용)
          sessionStorage.setItem('searchResults', JSON.stringify(results));
          setSearchResults(results);

          // 모의 데이터 사용 여부 확인
          const usingMockData = results.some(item => item.isMockData);
          if (usingMockData) {
            console.log('모의 데이터가 사용되었습니다. 실제 API 키를 설정하면 실제 검색 결과를 볼 수 있습니다.');
          }
        }
      } catch (searchError) {
        console.error('검색 실행 중 오류:', searchError);
        setError('검색 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('검색 최상위 오류:', error);

      // API 응답에 포함된 오류 메시지가 있으면 표시하고, 없으면 기본 메시지 표시
      const errorMessage = error.response?.data?.error || error.message || '알 수 없는 오류';

      if (errorMessage.includes('API 키') || errorMessage.includes('key')) {
        setError('API 키가 설정되지 않았습니다. 관리자에게 문의하세요.');
      } else {
        setError(`검색 중 오류가 발생했습니다: ${errorMessage}`);
      }
    } finally {
      setIsSearching(false);
      console.log('검색 작업 완료');
    }
  };

  // 콘텐츠 선택 핸들러 - 퀴즈 생성 페이지로 이동
  const handleContentSelect = (content: Content) => {
    if (!selectedCategory) {
      setError('먼저 카테고리를 선택해주세요.');
      return;
    }
    
    // 퀴즈 생성 페이지로 이동
    router.push(`/teacher/quiz/create?contentId=${content.id}&categoryId=${selectedCategory.id}`);
  };
  
  // 자동 검색 제거 - 사용자가 명시적으로 검색 버튼을 클릭할 때만 검색 실행

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">교사용 퀴즈 생성 플랫폼</h1>
        <p className="text-gray-600 mb-6">
          통일교육 주제를 선택하고 최신 콘텐츠를 검색하여 학생들을 위한 맞춤형 퀴즈를 생성하세요.
        </p>
        
        <Link href="/" className="text-primary hover:underline mb-6 inline-block">
          &larr; 메인 페이지로 돌아가기
        </Link>
      </div>
      
      {/* 학년 선택 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">학년 선택</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGrade('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedGrade === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            전체
          </button>
          {gradeLevels.map((grade) => (
            <button
              key={grade.id}
              onClick={() => setSelectedGrade(grade.id)}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedGrade === grade.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {grade.name}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 선택 섹션 */}
      <h2 className="text-2xl font-semibold mb-4">통일교육 카테고리 선택</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className={`bg-white rounded-lg border p-5 cursor-pointer transition-all ${
              selectedCategory?.id === category.id
                ? 'border-primary shadow-md'
                : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
            <p className="text-gray-600 mb-3 text-sm">{category.description}</p>
            <div className="flex flex-wrap gap-2">
              {category.gradeLevel.map((grade) => (
                <span key={grade} className="px-2 py-1 bg-gray-100 text-xs rounded-md">
                  {gradeLevels.find(g => g.id === grade)?.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 콘텐츠 검색 섹션 - 카테고리가 선택된 경우에만 표시 */}
      {selectedCategory && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">콘텐츠 검색</h2>
          <p className="text-gray-600 mb-4">
            <span className="font-medium">{selectedCategory.name}</span> 카테고리와 관련된 콘텐츠를 검색하여 퀴즈를 생성하세요.
          </p>
          <p className="text-gray-500 text-sm mb-4 bg-gray-50 p-2 rounded-md">
            <span className="font-medium">추천 키워드:</span> {selectedCategory.keywords.join(', ')}
          </p>

          {/* 실제 기사 검색 안내 */}
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4 text-sm text-blue-700">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium mb-1">실제 기사 검색 기능 안내</p>
                <p>네이버 검색 API를 통해 실제 통일 관련 기사를 검색합니다. API 키가 설정되지 않았거나 검색 결과가 없을 경우 AI가 생성한 가상 콘텐츠를 표시합니다.</p>
                <p className="mt-1">
                  <a href="https://developers.naver.com/apps/#/register" target="_blank" rel="noopener noreferrer" className="underline">네이버 개발자 센터</a>에서
                  API 키를 발급받은 후 <code className="bg-blue-100 px-1.5 py-0.5 rounded">.env.local</code> 파일에 설정하세요.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="mb-3 text-sm text-gray-600">
              통일교육 관련 키워드를 입력하고 검색 버튼을 클릭하세요.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="검색어를 입력하세요"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-gray-400 font-medium"
              >
                {isSearching ? '검색 중...' : '검색하기'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">검색 결과</h3>

              {/* 모의 데이터 알림 (첫 번째 결과가 모의 데이터인 경우) */}
              {searchResults[0].isMockData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4 text-sm text-yellow-700">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium">모의 데이터가 표시되고 있습니다</p>
                      <p className="mt-1">네이버 검색 API가 설정되지 않았거나 일시적으로 사용할 수 없습니다. API 키 설정 방법은 상단의 안내를 참고하세요.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {searchResults.map((content) => (
                  <div 
                    key={content.id}
                    className="bg-gray-50 p-4 rounded-md border border-gray-200 hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => handleContentSelect(content)}
                  >
                    <div className="flex items-start">
                      {content.imageUrl && (
                        <div className="mr-4 flex-shrink-0">
                          <img 
                            src={content.imageUrl} 
                            alt={content.title} 
                            className="w-20 h-20 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-lg font-medium mb-1">{content.title}</h4>
                          {content.isChildNews && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                              어린이 콘텐츠
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm mb-2">
                          출처: {content.source} {content.publishedAt && `• ${new Date(content.publishedAt).toLocaleDateString()}`}
                        </p>
                        <p className="text-gray-700 text-sm mb-2">{content.snippet}</p>

                        {/* 교육 태그 표시 */}
                        {content.educationTags && content.educationTags.length > 0 && (
                          <div className="mb-2">
                            {content.educationTags.map((tag, idx) => (
                              <span key={idx} className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mr-2 mb-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {content.sourceUrl && (
                          <a
                            href={content.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center text-sm"
                            onClick={(e) => e.stopPropagation()} // 클릭 시 상위 요소의 onClick 실행 방지
                          >
                            원문 기사 보기
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <span className="text-primary text-sm font-medium">이 콘텐츠로 퀴즈 만들기 &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 바로가기 링크 모음 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">퀴즈 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/teacher/quiz/create"
            className="bg-primary text-white px-4 py-3 rounded-md hover:bg-primary/90 transition-colors text-center flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            퀴즈 생성하기
          </Link>

          <Link
            href="/teacher/quiz/list"
            className="bg-gray-100 text-gray-800 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors text-center flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            내가 만든 퀴즈 목록
          </Link>

          <Link
            href="/teacher/quiz/share"
            className="bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors text-center flex items-center justify-center gap-2 col-span-1 md:col-span-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            URL로 퀴즈 공유하기
          </Link>
        </div>

        <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
          <p><strong>데이터베이스 지원!</strong> 이제 퀴즈가 자동으로 중앙 데이터베이스에 저장됩니다.</p>
          <p>학생들은 기본적으로 저장된 모든 퀴즈에 접근할 수 있으며, URL 공유 방식도 계속 사용 가능합니다.</p>
        </div>
      </div>
    </div>
  );
}
