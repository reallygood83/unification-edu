"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllQuizzes } from '@/lib/api-services';
import { Quiz } from '@/types';
import Link from 'next/link';

export default function ShareQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    // 저장된 퀴즈 목록 가져오기
    const loadQuizzes = () => {
      const savedQuizzes = getAllQuizzes();
      setQuizzes(savedQuizzes);
      setLoading(false);
    };
    
    loadQuizzes();
  }, []);
  
  // 퀴즈가 선택되면 공유 URL 생성
  const handleQuizSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const quizId = e.target.value;
    setSelectedQuiz(quizId);
    
    if (quizId) {
      const selectedQuizData = quizzes.find(q => q.id === quizId);
      if (selectedQuizData) {
        // 퀴즈 데이터를 JSON으로 변환하고 Base64로 인코딩
        const compressedQuiz = compressQuiz(selectedQuizData);

        // 디버깅: 압축된 퀴즈 데이터 확인
        console.log('공유할 퀴즈 정보:', {
          id: compressedQuiz.id,
          title: compressedQuiz.title,
          questionsCount: compressedQuiz.questions.length,
          firstQuestion: compressedQuiz.questions[0].question,
          category: compressedQuiz.category
        });

        const encodedQuiz = btoa(JSON.stringify(compressedQuiz));
        const shareUrl = `${window.location.origin}/student/shared-quiz?data=${encodedQuiz}`;
        setShareUrl(shareUrl);
      }
    } else {
      setShareUrl('');
    }
  };
  
  // 퀴즈 데이터를 압축하는 함수 (불필요한 필드 제거)
  const compressQuiz = (quiz: Quiz) => {
    // 필수 필드만 포함한 간소화된 퀴즈 객체 생성
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation
      })),
      category: quiz.category,
      difficulty: quiz.difficulty,
      targetGrade: quiz.targetGrade,
      // sourceContent의 필수 필드만 포함
      sourceContent: quiz.sourceContent ? {
        id: quiz.sourceContent.id,
        title: quiz.sourceContent.title,
        source: quiz.sourceContent.source,
        sourceUrl: quiz.sourceContent.sourceUrl || '',
      } : null
    };
  };
  
  // URL 복사 기능
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('URL 복사 실패:', err);
      });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">퀴즈 공유하기</h1>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">퀴즈 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">퀴즈 공유하기</h1>
        <Link href="/teacher" className="text-primary hover:underline">
          &larr; 교사 페이지로 돌아가기
        </Link>
      </div>
      
      {quizzes.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-yellow-700">
            공유할 퀴즈가 없습니다. 먼저 퀴즈를 생성해주세요.
          </p>
          <Link href="/teacher/quiz/create" className="text-primary hover:underline block mt-2">
            퀴즈 생성하기
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <label htmlFor="quizSelect" className="block text-sm font-medium text-gray-700 mb-2">
              공유할 퀴즈 선택
            </label>
            <select
              id="quizSelect"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={selectedQuiz}
              onChange={handleQuizSelect}
            >
              <option value="">-- 퀴즈 선택 --</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title} ({quiz.questions.length}문항)
                </option>
              ))}
            </select>
          </div>
          
          {shareUrl && (
            <div className="bg-white border border-gray-200 rounded-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">공유 링크</h2>
              <p className="text-sm text-gray-600 mb-4">
                <strong className="text-red-600">중요:</strong> 학생들이 퀴즈에 접근하는 유일한 방법은 이 링크를 공유하는 것입니다.
                학생 페이지에서는 기본 데모 퀴즈만 표시되므로, 반드시 아래 링크를 복사하여 학생들에게 공유해야 합니다.
                링크에는 퀴즈 데이터가 인코딩되어 있어 어느 컴퓨터에서든 동작합니다.
              </p>
              
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors"
                >
                  {copied ? '복사됨!' : '복사하기'}
                </button>
              </div>
              
              <div className="mt-4 flex gap-4">
                <Link
                  href={shareUrl}
                  target="_blank"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  링크 테스트하기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>

                <button
                  onClick={() => {
                    // 직접 퀴즈 정보 확인
                    const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);
                    if (selectedQuizData) {
                      console.log('선택된 퀴즈 원본 데이터:', {
                        id: selectedQuizData.id,
                        title: selectedQuizData.title,
                        questions: selectedQuizData.questions.map(q => q.question),
                        category: selectedQuizData.category
                      });
                      alert(`링크에 포함된 퀴즈: "${selectedQuizData.title}"\n문항 수: ${selectedQuizData.questions.length}개\n첫 번째 문제: "${selectedQuizData.questions[0].question.substring(0, 30)}..."`);
                    }
                  }}
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  퀴즈 정보 확인
                </button>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-medium text-blue-700 mb-2">퀴즈 공유 안내</h3>
            <ul className="list-disc pl-5 text-sm text-blue-600 space-y-1">
              <li>공유 링크는 퀴즈 데이터를 URL에 포함하여 전달합니다.</li>
              <li>매우 긴 퀴즈는 URL 길이 제한으로 인해 공유가 어려울 수 있습니다.</li>
              <li>학생들은 링크를 통해 퀴즈에 즉시 접근할 수 있습니다.</li>
              <li>퀴즈 결과는 각 학생의 브라우저에 저장됩니다.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}