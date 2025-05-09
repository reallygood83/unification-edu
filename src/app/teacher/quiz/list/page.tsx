"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Quiz } from '@/types';
import { getAllQuizzes } from '@/lib/api-services';
import { unificationCategories, difficultyLevels, gradeLevels } from '@/lib/data';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // 저장된 퀴즈 목록 가져오기
    const loadQuizzes = async () => {
      setLoading(true);

      try {
        // 로컬 스토리지에서 먼저 확인
        const localQuizzes = getAllQuizzes();

        if (localQuizzes.length > 0) {
          setQuizzes(localQuizzes);
        } else {
          // 로컬에 없으면 API에서 가져오기
          const response = await fetch('/api/mock/quiz');

          if (!response.ok) {
            throw new Error('퀴즈 목록을 불러오는데 실패했습니다.');
          }

          const data = await response.json();
          setQuizzes(data);
        }
      } catch (error) {
        console.error('퀴즈 목록 불러오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);
  
  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId: string): string => {
    const category = unificationCategories.find(c => c.id === categoryId);
    return category ? category.name : '알 수 없음';
  };
  
  // 난이도 이름 가져오기
  const getDifficultyName = (difficultyId: string): string => {
    const difficulty = difficultyLevels.find(d => d.id === difficultyId);
    return difficulty ? difficulty.name : '알 수 없음';
  };
  
  // 학년 이름 가져오기
  const getGradeNames = (gradeIds: string[]): string => {
    return gradeIds.map(id => {
      const grade = gradeLevels.find(g => g.id === id);
      return grade ? grade.name : '';
    }).join(', ');
  };
  
  // 퀴즈 삭제 함수
  const handleDeleteQuiz = (quizId: string) => {
    if (window.confirm('이 퀴즈를 삭제하시겠습니까?')) {
      try {
        // 현재 저장된 퀴즈 목록에서 해당 퀴즈 제거
        const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
        localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
        
        // 상태 업데이트
        setQuizzes(updatedQuizzes);
      } catch (error) {
        console.error('퀴즈 삭제 오류:', error);
        alert('퀴즈 삭제 중 오류가 발생했습니다.');
      }
    }
  };
  
  // 학생들에게 공유 링크 생성
  const getShareLink = (quizId: string): string => {
    // 실제 구현에서는 고유한 공유 링크를 생성해야 함
    return `${window.location.origin}/student/quiz/${quizId}`;
  };
  
  // 공유 링크 복사
  const copyShareLink = (quizId: string) => {
    const link = getShareLink(quizId);
    navigator.clipboard.writeText(link)
      .then(() => {
        alert('공유 링크가 클립보드에 복사되었습니다.');
      })
      .catch(err => {
        console.error('링크 복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">내가 만든 퀴즈 목록</h1>
        <p className="text-gray-600 mb-6">
          생성한 퀴즈 목록을 확인하고 관리할 수 있습니다. 학생들에게 공유할 수 있는 링크를 복사할 수 있습니다.
        </p>
        
        <Link href="/teacher" className="text-primary hover:underline mb-6 inline-block">
          &larr; 교사 페이지로 돌아가기
        </Link>
      </div>
      
      {/* 퀴즈 목록 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">퀴즈 목록을 불러오는 중...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-700 mb-4">아직 생성한 퀴즈가 없습니다.</p>
          <Link href="/teacher" className="bg-primary text-white px-4 py-2 rounded-md inline-block hover:bg-primary/90 transition-colors">
            퀴즈 만들러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyShareLink(quiz.id)}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20 transition-colors"
                      title="공유 링크 복사"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
                      title="퀴즈 삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 my-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                    카테고리: {getCategoryName(quiz.category)}
                  </span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md">
                    난이도: {getDifficultyName(quiz.difficulty)}
                  </span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md">
                    대상: {getGradeNames(quiz.targetGrade)}
                  </span>
                  <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md">
                    문항 수: {quiz.questions.length}개
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  생성 일시: {new Date(quiz.createdAt).toLocaleString()}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-500">콘텐츠 출처: {quiz.sourceContent.source}</span>
                  </div>
                  <Link 
                    href={`/teacher/quiz/${quiz.id}`}
                    className="text-primary hover:underline text-sm flex items-center"
                  >
                    상세보기
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 