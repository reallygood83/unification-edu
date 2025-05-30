"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { unificationCategories, gradeLevels, difficultyLevels } from '@/lib/data';
import { Content, Quiz, QuizQuestion, GradeLevel } from '@/types';
import { saveQuiz } from '@/lib/api-services';
import { generateQuiz } from '@/lib/openai-client';

function QuizCreator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentId = searchParams.get('contentId');
  const categoryId = searchParams.get('categoryId');
  
  const [content, setContent] = useState<Content | null>(null);
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizDescription, setQuizDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [targetGrades, setTargetGrades] = useState<GradeLevel[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  
  // 컴포넌트 마운트 시 콘텐츠 정보 로드
  useEffect(() => {
    // 실제 구현에서는 API 호출로 콘텐츠 정보를 가져와야 함
    // 지금은 로컬 스토리지나 세션 스토리지에 임시 저장된 검색 결과를 활용
    const storedResults = JSON.parse(sessionStorage.getItem('searchResults') || '[]');
    const foundContent = storedResults.find((item: Content) => item.id === contentId);
    
    if (foundContent) {
      setContent(foundContent);
      
      // 콘텐츠 제목을 기반으로 기본 퀴즈 제목 설정
      setQuizTitle(`${foundContent.title} - 통일교육 퀴즈`);
      setQuizDescription(`${foundContent.title} 콘텐츠를 기반으로 생성된 통일교육 퀴즈입니다.`);
    } else {
      setError('콘텐츠 정보를 찾을 수 없습니다.');
    }
    
    // 카테고리 정보 설정
    if (categoryId) {
      setCategory(categoryId);
      const foundCategory = unificationCategories.find(cat => cat.id === categoryId);
      if (foundCategory) {
        setTargetGrades(foundCategory.gradeLevel);
      }
    }
  }, [contentId, categoryId]);
  
  // 퀴즈 생성 함수
  const handleGenerateQuiz = async () => {
    if (!content) {
      setError('콘텐츠 정보가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('서버 측 AI 퀴즈 API 직접 호출');

      try {
        // 서버 측 API 직접 호출 - generateQuiz 함수 우회
        const response = await fetch('/api/ai-quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            category,
            difficulty,
            questionCount
          }),
        });

        if (!response.ok) {
          throw new Error('서버 API 응답 오류');
        }

        const data = await response.json();

        if (data.questions && data.questions.length > 0) {
          setGeneratedQuestions(data.questions);
        } else {
          // generateQuiz 함수를 폴백으로 사용
          const backupQuestions = await generateQuiz(
            content,
            category,
            difficulty,
            questionCount
          );

          if (backupQuestions.length === 0) {
            setError('퀴즈 생성에 실패했습니다. 다시 시도해주세요.');
          } else {
            setGeneratedQuestions(backupQuestions);
          }
        }
      } catch (apiError) {
        console.error('서버 API 오류, 기존 함수로 폴백:', apiError);

        // OpenAI API를 사용하여 퀴즈 생성 (폴백)
        const questions = await generateQuiz(
          content,
          category,
          difficulty,
          questionCount
        );

        if (questions.length === 0) {
          setError('퀴즈 생성에 실패했습니다. 다시 시도해주세요.');
        } else {
          setGeneratedQuestions(questions);
        }
      }
    } catch (error) {
      console.error('퀴즈 생성 오류:', error);
      setError('퀴즈 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  // 퀴즈 저장 함수
  const handleSaveQuiz = () => {
    if (!content || generatedQuestions.length === 0) {
      setError('저장할 퀴즈가 없습니다.');
      return;
    }
    
    try {
      // 퀴즈 객체 생성
      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: quizTitle,
        description: quizDescription,
        questions: generatedQuestions,
        category,
        sourceContent: content,
        createdAt: new Date().toISOString(),
        difficulty,
        targetGrade: targetGrades,
      };
      
      // 퀴즈 저장
      const success = saveQuiz(newQuiz);
      
      if (success) {
        // 저장 성공 시 퀴즈 목록 페이지로 이동
        router.push('/teacher/quiz/list');
      } else {
        setError('퀴즈 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('퀴즈 저장 오류:', error);
      setError('퀴즈 저장 중 오류가 발생했습니다.');
    }
  };
  
  // 학년 선택 토글 함수
  const toggleGradeSelection = (grade: GradeLevel) => {
    setTargetGrades(prev => 
      prev.includes(grade)
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };
  
  // 문항 수 변경 함수
  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value);
    if (!isNaN(count) && count >= 1 && count <= 10) {
      setQuestionCount(count);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">AI 퀴즈 생성</h1>
        <p className="text-gray-600 mb-6">
          선택한 콘텐츠를 기반으로 학생들을 위한 맞춤형 퀴즈를 생성합니다.
        </p>

        <Link href="/teacher" className="text-primary hover:underline mb-6 inline-block">
          &larr; 교사 페이지로 돌아가기
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* 선택된 콘텐츠 정보 */}
      {content && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">선택한 콘텐츠</h2>
          <div className="flex items-start">
            {content.imageUrl && (
              <div className="mr-4 flex-shrink-0">
                <img
                  src={content.imageUrl}
                  alt={content.title}
                  className="w-24 h-24 object-cover rounded"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium mb-1">{content.title}</h3>
              <p className="text-gray-500 text-sm mb-2">
                출처: {content.source} {content.publishedAt && `• ${new Date(content.publishedAt).toLocaleDateString()}`}
              </p>
              <p className="text-gray-700 mb-2">{content.snippet}</p>
              {content.sourceUrl && (
                <a
                  href={content.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  원문 기사 보기
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 통일 교육 목표 및 아티클 활용 설명 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">아티클 활용 방식</h3>
              <p className="mt-1 text-sm text-blue-600">
                AI는 선택한 콘텐츠의 원문을 읽고 요약하여 퀴즈를 생성합니다.
                원문 URL이 제공된 경우 실제 아티클 내용을 분석하고, 그렇지 않은 경우 콘텐츠 요약 정보를 활용합니다.
                더 정확한 퀴즈 생성을 위해 원문 기사를 함께 확인해보세요.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">통일교육 목표</h3>
              <p className="mt-1 text-sm text-green-600">
                이 퀴즈는 단순한 지식 평가를 넘어 학생들이 통일의 필요성과 가치를 이해하도록 설계됩니다.
                평화, 상호존중, 공동번영의 가치를 중심으로 학생들의 비판적 사고력을 기르고
                통일에 대한 긍정적 인식을 형성하는 것을 목표로 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 퀴즈 설정 폼 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">퀴즈 설정</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">퀴즈 제목</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="퀴즈 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">퀴즈 설명</label>
            <textarea
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="퀴즈에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">난이도 및 학년 수준</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {difficultyLevels.map((level) => {
                // 난이도에 따른 학년 설명
                const difficultyDescription = {
                  'easy': '초등학생 수준',
                  'medium': '중학생 수준',
                  'hard': '고등학생 수준'
                }[level.id] || '';

                return (
                  <label
                    key={level.id}
                    className={`flex items-center px-4 py-3 rounded-md border ${
                      difficulty === level.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/30'
                    } cursor-pointer transition-colors`}
                  >
                    <input
                      type="radio"
                      checked={difficulty === level.id}
                      onChange={() => setDifficulty(level.id as 'easy' | 'medium' | 'hard')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <div className="ml-2">
                      <span className="text-gray-800 font-medium">{level.name}</span>
                      <p className="text-xs text-gray-500 mt-1">{difficultyDescription}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <p className="text-sm text-gray-500">
              난이도에 따라 문제의 복잡성과 언어 난이도가 조정됩니다. 대상 학년에 맞는 적절한 난이도를 선택하세요.
            </p>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">대상 학년</label>
            <div className="flex flex-wrap gap-3">
              {gradeLevels.map((grade) => (
                <label key={grade.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={targetGrades.includes(grade.id as GradeLevel)}
                    onChange={() => toggleGradeSelection(grade.id as GradeLevel)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">{grade.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">문항 수 (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={questionCount}
              onChange={handleQuestionCountChange}
              className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors disabled:bg-gray-400"
            >
              {loading ? '퀴즈 생성 중...' : 'AI로 퀴즈 생성하기'}
            </button>
          </div>
        </div>
      </div>

      {/* 생성된 퀴즈 미리보기 */}
      {generatedQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">생성된 퀴즈 미리보기</h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-1">{quizTitle}</h3>
            <p className="text-gray-600">{quizDescription}</p>
          </div>

          <div className="space-y-6">
            {generatedQuestions.map((question, questionIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-md p-4">
                <h4 className="text-lg font-medium mb-3">
                  {questionIndex + 1}. {question.question}
                </h4>

                <div className="space-y-2 mb-4">
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`p-3 rounded-md ${
                        question.correctAnswerIndex === optionIndex
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                          question.correctAnswerIndex === optionIndex
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <p>{option}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                  <p className="text-sm">
                    <span className="font-medium">정답 설명:</span> {question.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={handleSaveQuiz}
              className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              퀴즈 저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateQuizPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8">로딩 중...</div>}>
      <QuizCreator />
    </Suspense>
  );
}
