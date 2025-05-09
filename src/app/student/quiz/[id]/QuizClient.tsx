"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Quiz, QuizAttempt, StudentProgress } from '@/types';
import { unificationCategories } from '@/lib/data';

interface QuizClientProps {
  quizId: string;
  initialQuizData: Quiz | null;
}

export default function QuizClient({ quizId, initialQuizData }: QuizClientProps) {
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<Quiz | null>(initialQuizData);
  const [loading, setLoading] = useState<boolean>(!initialQuizData);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  
  const [score, setScore] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  
  // 서버 API에서 퀴즈 데이터 불러오기
  const fetchQuizFromAPI = async () => {
    try {
      setLoading(true);

      // 모의 API 라우트에서 퀴즈 데이터 가져오기
      const response = await fetch(`/api/mock/quiz/${quizId}`);

      if (!response.ok) {
        throw new Error('퀴즈를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setQuiz(data);
    } catch (error) {
      console.error('퀴즈 불러오기 오류:', error);
      setError('퀴즈를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quiz) {
      setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
      setQuizStartTime(Date.now());
    } else if (!initialQuizData) {
      // 로컬에 데이터가 없으면 서버 API에서 불러오기
      fetchQuizFromAPI();
    }
  }, [quiz, initialQuizData]);
  
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  
  const handleSelectAnswer = (answerIndex: number) => {
    if (quizCompleted) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmitQuiz = () => {
    if (!quiz) return;
    
    const unansweredQuestions = selectedAnswers.filter(answer => answer === -1).length;
    if (unansweredQuestions > 0) {
      if (!window.confirm(`아직 ${unansweredQuestions}개의 문제를 풀지 않았습니다. 정말 제출하시겠습니까?`)) {
        return;
      }
    }
    
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    
    const totalQuestions = quiz.questions.length;
    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    const endTime = Date.now();
    const calculatedTimeSpent = Math.floor((endTime - quizStartTime) / 1000);
    
    setScore(calculatedScore);
    setTimeSpent(calculatedTimeSpent);
    setQuizCompleted(true);
    
    saveQuizAttempt(quiz.id, calculatedScore, totalQuestions, selectedAnswers, calculatedTimeSpent);
  };
  
  const saveQuizAttempt = (
    quizId: string, 
    score: number, 
    totalQuestions: number, 
    answers: number[], 
    timeSpent: number
  ) => {
    try {
      const savedProgressString = localStorage.getItem('studentProgress');
      if (!savedProgressString) return;
      
      const savedProgress: StudentProgress = JSON.parse(savedProgressString);
      
      const newAttempt: QuizAttempt = {
        id: `attempt-${Date.now()}`,
        quizId,
        userId: savedProgress.userId,
        score,
        totalQuestions,
        date: new Date().toISOString(),
        answers,
        timeSpent
      };
      
      const attemptIndex = savedProgress.quizAttempts.findIndex(attempt => attempt.quizId === quizId);
      
      if (attemptIndex !== -1) {
        savedProgress.quizAttempts[attemptIndex] = newAttempt;
      } else {
        savedProgress.quizAttempts.push(newAttempt);
      }
      
      const today = new Date().toISOString().split('T')[0];
      const lastCompleted = savedProgress.lastCompletedDate;
      
      if (lastCompleted) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastCompleted === yesterdayStr) {
          savedProgress.streakCount += 1;
        } else if (lastCompleted !== today) {
          savedProgress.streakCount = 1;
        }
      } else {
        savedProgress.streakCount = 1;
      }
      
      savedProgress.lastCompletedDate = today;
      
      if (!savedProgress.completedDays) {
        savedProgress.completedDays = 1;
      } else {
        savedProgress.completedDays += 1;
      }
      
      if (savedProgress.streakCount >= 5 && !savedProgress.certificateEarned) {
        savedProgress.certificateEarned = true;
      }
      
      localStorage.setItem('studentProgress', JSON.stringify(savedProgress));
    } catch (error) {
      console.error('퀴즈 시도 저장 오류:', error);
    }
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = unificationCategories.find(c => c.id === categoryId);
    return category ? category.name : '기타';
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
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
        <Link href="/student" className="text-primary hover:underline">
          &larr; 학생 페이지로 돌아가기
        </Link>
      </div>
    );
  }
  
  if (quizCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2 text-center">퀴즈 결과</h1>
            <p className="text-center text-gray-600 mb-2">{quiz.title}</p>
            {quiz.sourceContent?.sourceUrl && (
              <div className="text-center mb-6">
                <a
                  href={quiz.sourceContent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center justify-center"
                >
                  퀴즈 출처 원문 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
            
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-blue-50 border-4 border-blue-500">
                <span className="text-3xl font-bold text-blue-700">{score}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 text-sm">문항 수</p>
                <p className="text-xl font-semibold">{quiz.questions.length}개</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 text-sm">정답 수</p>
                <p className="text-xl font-semibold">
                  {selectedAnswers.filter((answer, index) => 
                    answer === quiz.questions[index].correctAnswerIndex
                  ).length}개
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 text-sm">소요 시간</p>
                <p className="text-xl font-semibold">{formatTime(timeSpent)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 text-sm">카테고리</p>
                <p className="text-xl font-semibold">{getCategoryName(quiz.category)}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Link href="/student" className="text-primary hover:underline">
                학생 페이지로 돌아가기
              </Link>
              <Link 
                href={`/student/certificate`}
                className={`${
                  score >= 80 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-400 text-white cursor-not-allowed'
                } px-4 py-2 rounded-md transition-colors`}
                onClick={(e) => score < 80 && e.preventDefault()}
              >
                {score >= 80 ? '인증서 확인하기' : '80% 이상 획득 시 인증서 확인 가능'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">{quiz.title}</h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {getCategoryName(quiz.category)}
              </span>
            </div>
            {quiz.sourceContent?.sourceUrl && (
              <div className="text-sm">
                <a
                  href={quiz.sourceContent.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  퀴즈 출처 원문 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2 text-sm">
              <span>문제 {currentQuestionIndex + 1} / {quiz.questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% 완료</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {currentQuestion && (
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4">
                {currentQuestionIndex + 1}. {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex}
                    onClick={() => handleSelectAnswer(optionIndex)}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      selectedAnswers[currentQuestionIndex] === optionIndex
                        ? 'border-primary bg-primary/5 hover:bg-primary/10'
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                        selectedAnswers[currentQuestionIndex] === optionIndex
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + optionIndex)}
                      </div>
                      <p>{option}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전 문제
            </button>
            
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                다음 문제
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                제출하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 