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
    // 카테고리 키워드를 사용하여 기본 검색어 설정
    setSearchQuery(category.keywords[0]);
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

      // API를 통해 콘텐츠 검색
      const results = await searchContents(searchQuery);

      if (results.length === 0) {
        setError('검색 결과가 없습니다. 다른 검색어를 시도해보세요.');
      } else {
        // 검색 결과를 세션 스토리지에 저장 (퀴즈 생성 페이지에서 사용)
        sessionStorage.setItem('searchResults', JSON.stringify(results));
        setSearchResults(results);
      }
    } catch (error: any) {
      console.error('검색 오류:', error);

      // API 응답에 포함된 오류 메시지가 있으면 표시하고, 없으면 기본 메시지 표시
      const errorMessage = error.response?.data?.error || error.message;

      if (errorMessage.includes('API 키') || errorMessage.includes('key')) {
        setError('API 키가 설정되지 않았습니다. 관리자에게 문의하세요.');
      } else {
        setError(`검색 중 오류가 발생했습니다: ${errorMessage}`);
      }
    } finally {
      setIsSearching(false);
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
  
  // 카테고리가 변경될 때 자동으로 검색
  useEffect(() => {
    if (selectedCategory && searchQuery) {
      handleSearch();
    }
  }, [selectedCategory]);

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
            추천 키워드: {selectedCategory.keywords.join(', ')}
          </p>
          
          <div className="flex gap-2 mb-6">
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
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-gray-400"
            >
              {isSearching ? '검색 중...' : '검색'}
            </button>
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
                      <div>
                        <h4 className="text-lg font-medium mb-1">{content.title}</h4>
                        <p className="text-gray-500 text-sm mb-2">
                          출처: {content.source} {content.publishedAt && `• ${new Date(content.publishedAt).toLocaleDateString()}`}
                        </p>
                        <p className="text-gray-700 text-sm">{content.snippet}</p>
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
      
      {/* 내가 만든 퀴즈 목록으로 이동 */}
      <div className="mt-8 text-center">
        <Link href="/teacher/quiz/list" className="inline-flex items-center text-primary hover:underline">
          내가 만든 퀴즈 목록 보기
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
