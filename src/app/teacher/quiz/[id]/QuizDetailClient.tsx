"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Quiz } from '@/types';
import { unificationCategories, difficultyLevels, gradeLevels } from '@/lib/data';

interface QuizDetailClientProps {
  quizId: string;
  initialQuizData: Quiz | null;
}

export default function QuizDetailClient({ quizId, initialQuizData }: QuizDetailClientProps) {
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<Quiz | null>(initialQuizData);
  const [loading, setLoading] = useState<boolean>(!initialQuizData);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>('');
  
  // 서버 API에서 퀴즈 데이터 불러오기
  const fetchQuizFromAPI = async () => {
    try {
      setLoading(true);

      try {
        // 먼저 API로부터 비동기적으로 퀴즈 가져오기 시도
        const { getQuizById } = await import('@/lib/api-services');
        const dbQuiz = await getQuizById(quizId);

        if (dbQuiz) {
          console.log('DB에서 퀴즈 로드 성공:', dbQuiz.title);
          setQuiz(dbQuiz);
          setLoading(false);
          return;
        }
      } catch (dbError) {
        console.warn('DB에서 퀴즈 로드 실패, API 폴백:', dbError);
      }

      // API 호출 시도
      const response = await fetch(`/api/quiz?id=${quizId}`);

      if (!response.ok) {
        throw new Error('퀴즈를 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      if (!data || !data.questions || data.questions.length === 0) {
        throw new Error('유효하지 않은 퀴즈 데이터입니다.');
      }

      setQuiz(data);
      console.log('API에서 퀴즈 데이터 로드 성공:', data.title);
    } catch (error) {
      console.error('퀴즈 불러오기 오류:', error);
      setError('퀴즈를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!quiz && !initialQuizData) {
      // 로컬에 데이터가 없으면 서버 API에서 불러오기
      fetchQuizFromAPI();
    }
    
    // 공유 링크 생성
    if (typeof window !== 'undefined') {
      setShareLink(`${window.location.origin}/student/quiz/${quizId}`);
    }
  }, [quiz, initialQuizData, quizId]);
  
  const handleDeleteQuiz = () => {
    if (window.confirm('이 퀴즈를 삭제하시겠습니까?')) {
      try {
        // 현재 저장된 퀴즈 목록에서 해당 퀴즈 제거
        const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
        const updatedQuizzes = savedQuizzes.filter((q: Quiz) => q.id !== quizId);
        localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
        
        // 목록 페이지로 리다이렉트
        router.push('/teacher/quiz/list');
      } catch (error) {
        console.error('퀴즈 삭제 오류:', error);
        alert('퀴즈 삭제 중 오류가 발생했습니다.');
      }
    }
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        alert('공유 링크가 클립보드에 복사되었습니다.');
      })
      .catch(err => {
        console.error('링크 복사 실패:', err);
        alert('링크 복사에 실패했습니다.');
      });
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = unificationCategories.find(c => c.id === categoryId);
    return category ? category.name : '기타';
  };
  
  const getDifficultyName = (difficultyId: string) => {
    const difficulty = difficultyLevels.find(d => d.id === difficultyId);
    return difficulty ? difficulty.name : '알 수 없음';
  };
  
  const getGradeNames = (gradeIds: string[]) => {
    return gradeIds.map(id => {
      const grade = gradeLevels.find(g => g.id === id);
      return grade ? grade.name : '';
    }).join(', ');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-600">퀴즈를 불러오는 중...</p>
      </div>
    );
  }
  
  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error || '퀴즈를 찾을 수 없습니다.'}
        </div>
        <Link href="/teacher/quiz/list" className="text-primary hover:underline">
          &larr; 퀴즈 목록으로 돌아가기
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/teacher/quiz/list" className="text-primary hover:underline mb-6 inline-block">
          &larr; 퀴즈 목록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{quiz.title}</h1>
        
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
            문항 수: {Array.isArray(quiz.questions) ? quiz.questions.length : 0}개
          </span>
        </div>
        
        <p className="text-gray-600 mb-6">{quiz.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={copyShareLink}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            공유 링크 복사
          </button>
          
          <Link 
            href={`/teacher/quiz/share?id=${quizId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            공유 설정
          </Link>
          
          <button
            onClick={handleDeleteQuiz}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            퀴즈 삭제
          </button>
        </div>
        
        {quiz.sourceContent && (
          <div className="mb-8 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">원본 콘텐츠 정보</h2>
            <p><strong>제목:</strong> {quiz.sourceContent.title}</p>
            <p><strong>출처:</strong> {quiz.sourceContent.source}</p>
            {quiz.sourceContent.sourceUrl && (
              <p>
                <strong>원문 링크:</strong>{' '}
                <a 
                  href={quiz.sourceContent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {quiz.sourceContent.sourceUrl}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">퀴즈 문항</h2>
        
        <div className="space-y-8">
          {quiz.questions.map((question, qIndex) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {qIndex + 1}. {question.question}
                </h3>
                
                <div className="space-y-3 mb-6">
                  {question.options.map((option, oIndex) => (
                    <div 
                      key={oIndex}
                      className={`p-3 rounded-md border ${
                        oIndex === question.correctAnswerIndex
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                          oIndex === question.correctAnswerIndex
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + oIndex)}
                        </div>
                        <p>{option}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {question.explanation && (
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm font-semibold text-blue-800 mb-1">정답 설명:</p>
                    <p className="text-blue-800">{question.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-8">
        생성 일시: {new Date(quiz.createdAt).toLocaleString()}
      </div>
    </div>
  );
}