"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quiz, StudentProgress } from '@/types';
import { getAllQuizzes } from '@/lib/api-services';
import { unificationCategories } from '@/lib/data';

export default function StudentPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  useEffect(() => {
    // 퀴즈 목록 및 학생 진행 상황 로드
    const loadData = () => {
      setLoading(true);
      
      // 퀴즈 목록 가져오기
      const savedQuizzes = getAllQuizzes();
      setQuizzes(savedQuizzes);
      
      // 학생 진행 상황 가져오기
      try {
        const savedProgress = localStorage.getItem('studentProgress');
        if (savedProgress) {
          setProgress(JSON.parse(savedProgress));
        } else {
          // 초기 진행 상황 설정
          const initialProgress: StudentProgress = {
            id: `progress-${Date.now()}`,
            userId: 'student-1', // 실제 구현에서는 로그인한 학생 ID
            completedDays: 0,
            lastCompletedDate: '',
            quizAttempts: [],
            certificateEarned: false,
            streakCount: 0
          };
          localStorage.setItem('studentProgress', JSON.stringify(initialProgress));
          setProgress(initialProgress);
        }
      } catch (error) {
        console.error('진행 상황 로드 오류:', error);
      }
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // 퀴즈가 이미 풀린 것인지 확인
  const isQuizAttempted = (quizId: string): boolean => {
    return progress?.quizAttempts.some(attempt => attempt.quizId === quizId) || false;
  };
  
  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId: string): string => {
    const category = unificationCategories.find(c => c.id === categoryId);
    return category ? category.name : '기타';
  };
  
  // 카테고리로 필터링된 퀴즈 목록
  const filteredQuizzes = selectedCategory === 'all'
    ? quizzes
    : quizzes.filter(quiz => quiz.category === selectedCategory);
  
  // 인증서 획득 여부
  const hasCertificate = progress?.certificateEarned || false;
  
  // 아직 완료해야 할 연속 일수
  const daysToComplete = 5 - (progress?.streakCount || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">통일교육 퀴즈 학습</h1>
        <p className="text-gray-600 mb-6">
          다양한 주제의 통일교육 퀴즈를 풀고 통일 지식을 쌓아보세요. 5일 연속으로 퀴즈를 완료하면 통일교육 수료 인증서를 받을 수 있습니다.
        </p>
        
        <Link href="/" className="text-primary hover:underline mb-6 inline-block">
          &larr; 메인 페이지로 돌아가기
        </Link>
      </div>
      
      {/* 학습 진행 상황 */}
      {progress && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">나의 학습 현황</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <p className="text-gray-700 mb-1">
                완료한 퀴즈 수: <span className="font-semibold">{progress.quizAttempts.length}개</span>
              </p>
              <p className="text-gray-700 mb-1">
                연속 학습 일수: <span className="font-semibold">{progress.streakCount}일</span>
              </p>
              <p className="text-gray-700">
                인증서 획득까지: <span className="font-semibold">{hasCertificate ? '획득 완료!' : `${daysToComplete}일 남음`}</span>
              </p>
            </div>
            
            {hasCertificate && (
              <Link href="/student/certificate" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                인증서 보기
              </Link>
            )}
          </div>
          
          {/* 진행 상황 바 */}
          <div className="mt-6">
            <div className="flex justify-between mb-2 text-sm">
              <span>연속 학습 진행도</span>
              <span>{progress.streakCount}/5일</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${(progress.streakCount / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* 카테고리 필터 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">카테고리 선택</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            전체
          </button>
          {unificationCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedCategory === category.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 퀴즈 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">퀴즈 목록을 불러오는 중...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-700 mb-4">이 카테고리에 아직 퀴즈가 없습니다.</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            모든 퀴즈 보기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const attempted = isQuizAttempted(quiz.id);
            
            return (
              <Link key={quiz.id} href={`/student/quiz/${quiz.id}`}>
                <div className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                  attempted ? 'border-green-200' : 'border-gray-100'
                }`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold mb-2">{quiz.title}</h2>
                      {attempted && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          완료됨
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{quiz.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                        {getCategoryName(quiz.category)}
                      </span>
                      <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md">
                        문항 수: {quiz.questions.length}개
                      </span>
                    </div>
                    
                    <div className="mt-2 flex justify-end">
                      <span className="inline-flex items-center text-primary font-medium text-sm">
                        {attempted ? '다시 풀기' : '퀴즈 풀기'}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      
      {/* 완료한 퀴즈 목록으로 이동 */}
      {progress && progress.quizAttempts.length > 0 && (
        <div className="mt-8 text-center">
          <Link href="/student/history" className="inline-flex items-center text-primary hover:underline">
            내 퀴즈 기록 보기
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
