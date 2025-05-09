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
  
  // 결과 상태
  const [score, setScore] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  
  // 초기화
  useEffect(() => {
    if (quiz) {
      // 빈 답변 배열 초기화
      setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
      setQuizStartTime(Date.now()); // 퀴즈 시작 시간 기록
    } else if (!initialQuizData) {
      setError('퀴즈를 찾을 수 없습니다.');
    }
  }, [quiz, initialQuizData]);
  
  // 현재 문제
  const currentQuestion = quiz?.questions[currentQuestionIndex];
  
  // 답변 선택 핸들러
  const handleSelectAnswer = (answerIndex: number) => {
    if (quizCompleted) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };
  
  // 다음 문제로 이동
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // 이전 문제로 이동
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // 퀴즈 제출
  const handleSubmitQuiz = () => {
    if (!quiz) return;
    
    // 풀지 않은 문제가 있는지 확인
    const unansweredQuestions = selectedAnswers.filter(answer => answer === -1).length;
    if (unansweredQuestions > 0) {
      if (!window.confirm(`아직 ${unansweredQuestions}개의 문제를 풀지 않았습니다. 정말 제출하시겠습니까?`)) {
        return;
      }
    }
    
    // 점수 계산
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    
    const totalQuestions = quiz.questions.length;
    const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
    
    // 소요 시간 계산 (초 단위)
    const endTime = Date.now();
    const calculatedTimeSpent = Math.floor((endTime - quizStartTime) / 1000);
    
    setScore(calculatedScore);
    setTimeSpent(calculatedTimeSpent);
    setQuizCompleted(true);
    
    // 퀴즈 결과 저장
    saveQuizAttempt(quiz.id, calculatedScore, totalQuestions, selectedAnswers, calculatedTimeSpent);
  };
  
  // 퀴즈 시도 결과 저장
  const saveQuizAttempt = (
    quizId: string,
    score: number,
    totalQuestions: number,
    answers: number[],
    timeSpent: number
  ) => {
    try {
      // 현재 저장된 진행 상황 가져오기
      const savedProgressString = localStorage.getItem('studentProgress');
      if (!savedProgressString) return;
      
      const savedProgress: StudentProgress = JSON.parse(savedProgressString);
      
      // 새 퀴즈 시도 생성
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
      
      // 이전에 같은 퀴즈를 풀었는지 확인
      const attemptIndex = savedProgress.quizAttempts.findIndex(attempt => attempt.quizId === quizId);
      
      if (attemptIndex !== -1) {
        // 기존 시도 업데이트
        savedProgress.quizAttempts[attemptIndex] = newAttempt;
      } else {
        // 새 시도 추가
        savedProgress.quizAttempts.push(newAttempt);
      }
      
      // 연속 학습 계산
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
      const lastCompleted = savedProgress.lastCompletedDate;
      
      if (lastCompleted) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastCompleted === yesterdayStr) {
          // 어제 학습했으면 연속 일수 증가
          savedProgress.streakCount += 1;
        } else if (lastCompleted !== today) {
          // 어제도 아니고 오늘도 아니면 연속 일수 초기화
          savedProgress.streakCount = 1;
        }
      } else {
        // 첫 학습
        savedProgress.streakCount = 1;
      }
      
      // 오늘 날짜 저장
      savedProgress.lastCompletedDate = today;
      
      // 완료 일수 업데이트
      if (!savedProgress.completedDays) {
        savedProgress.completedDays = 1;
      } else {
        savedProgress.completedDays += 1;
      }
      
      // 인증서 획득 확인
      if (savedProgress.streakCount >= 5 && !savedProgress.certificateEarned) {
        savedProgress.certificateEarned = true;
      }
      
      // 업데이트된 진행 상황 저장
      localStorage.setItem('studentProgress', JSON.stringify(savedProgress));
    } catch (error) {
      console.error('퀴즈 시도 저장 오류:', error);
    }
  };
  
  // 카테고리 이름 가져오기
  const getCategoryName = (categoryId: string): string => {
    const category = unificationCategories.find(c => c.id === categoryId);
    return category ? category.name : '기타';
  };
  
  // 소요 시간 포맷
  const formatTime = (seconds: number): string => {
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

  // 퀴즈 결과 화면
  if (quizCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2 text-center">퀴즈 결과</h1>
            <p className="text-center text-gray-600 mb-6">{quiz.title}</p>
            
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
            
            <h2 className="text-xl font-semibold mb-4">정답 확인</h2>
            
            <div className="space-y-6 mb-8">
              {quiz.questions.map((question, questionIndex) => {
                const isCorrect = selectedAnswers[questionIndex] === question.correctAnswerIndex;
                
                return (
                  <div 
                    key={question.id} 
                    className={`border rounded-md p-4 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start mb-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                        isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {isCorrect ? '✓' : '✗'}
                      </div>
                      <h3 className="font-medium">
                        {questionIndex + 1}. {question.question}
                      </h3>
                    </div>
                    
                    <div className="ml-8 space-y-2 mb-3">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          className={`p-2 rounded-md ${
                            question.correctAnswerIndex === optionIndex
                              ? 'bg-green-100 border border-green-200'
                              : selectedAnswers[questionIndex] === optionIndex
                                ? 'bg-red-100 border border-red-200'
                                : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 text-xs ${
                              question.correctAnswerIndex === optionIndex
                                ? 'bg-green-500 text-white'
                                : selectedAnswers[questionIndex] === optionIndex
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                            }`}>
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <p className="text-sm">{option}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
                    
                    <div className="ml-8 bg-blue-50 border border-blue-100 rounded-md p-3">
                      <p className="text-sm">
                        <span className="font-medium">정답 설명:</span> {question.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
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
  
  // 퀴즈 풀이 화면
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">{quiz.title}</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {getCategoryName(quiz.category)}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          {/* 진행 바 */}
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
          
          {/* 현재 문제 */}
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
          
          {/* 네비게이션 버튼 */}
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