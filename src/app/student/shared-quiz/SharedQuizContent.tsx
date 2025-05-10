"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Quiz } from '@/types';
import SharedQuizClient from './SharedQuizClient';

export default function SharedQuizContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');

    if (!data) {
      setError('퀴즈 데이터가 없습니다. 올바른 링크를 사용해주세요.');
      setLoading(false);
      return;
    }

    try {
      // 경고문 표시 (디버깅 모드에서만)
      console.warn(
        '중요 - URL에서 퀴즈 데이터를 직접 로드합니다. 서버 API나 다른 라우트를 거치지 않습니다.'
      );

      let decodedData: string;
      try {
        // Base64로 인코딩된 데이터를 디코딩
        decodedData = atob(data);
        // 디코딩된 데이터의 처음 일부분 확인 (디버깅용)
        console.log('디코딩된 데이터(처음 100자):', decodedData.substring(0, 100));
      } catch (decodeError) {
        console.error('Base64 디코딩 오류:', decodeError);
        setError('유효하지 않은 퀴즈 URL 형식입니다. 올바른 링크를 사용해주세요.');
        setLoading(false);
        return;
      }

      let parsedQuiz: Partial<Quiz>;
      try {
        // JSON 파싱
        parsedQuiz = JSON.parse(decodedData);

        // 기본적인 유효성 검사
        if (!parsedQuiz || typeof parsedQuiz !== 'object') {
          throw new Error('퀴즈 데이터를 찾을 수 없거나 형식이 잘못되었습니다.');
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        setError('퀴즈 데이터 형식이 잘못되었습니다. 올바른 링크를 사용해주세요.');
        setLoading(false);
        return;
      }

      // 원본 데이터를 디버깅용으로 보존
      const originalData = data.substring(0, 100) + '...';
      console.log('원본 URL 데이터 시작 부분:', originalData);

      // 더 강화된 퀴즈 데이터 유효성 검사 및 복구
      // 필수 필드에 대한 철저한 유효성 검사 및 기본값 설정

      // 1. 문제 확인 및 복구
      let questions: QuizQuestion[] = [];

      if (!parsedQuiz.questions || !Array.isArray(parsedQuiz.questions)) {
        console.warn('유효하지 않은 문제 필드, 기본 문제 생성:', parsedQuiz.questions);
        // 기본 문제 생성
        questions = [
          {
            id: `q-recovery-${Date.now()}`,
            question: '복구된 샘플 문제입니다.',
            options: ['옵션 1', '옵션 2', '옵션 3', '옵션 4'],
            correctAnswerIndex: 0,
            explanation: '데이터 복구 중 생성된 문제입니다.'
          }
        ];
      } else {
        // 문제 배열 내부의 유효성 확인 및 수정
        questions = parsedQuiz.questions.map((q, index) => {
          if (!q || typeof q !== 'object') {
            // 손상된 문제 복구
            console.warn(`문제 #${index+1} 복구 필요:`, q);
            return {
              id: `q-recovery-${Date.now()}-${index}`,
              question: `복구된 문제 #${index+1}`,
              options: ['옵션 1', '옵션 2', '옵션 3', '옵션 4'],
              correctAnswerIndex: 0,
              explanation: '데이터 복구 중 생성된 문제입니다.'
            };
          }

          // 각 문제 필드의 철저한 검사 및 기본값 설정
          const safeQuestion: QuizQuestion = {
            id: q.id || `q-${Date.now()}-${index}`,
            question: q.question || `문제 #${index+1}`,
            options: Array.isArray(q.options) && q.options.length >= 2
              ? q.options
              : ['옵션 1', '옵션 2', '옵션 3', '옵션 4'],
            correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0
              ? q.correctAnswerIndex
              : 0,
            explanation: q.explanation || '설명이 제공되지 않았습니다.'
          };

          // 옵션이 4개 미만인 경우 기본 옵션 추가
          if (safeQuestion.options.length < 4) {
            const missingCount = 4 - safeQuestion.options.length;
            for (let i = 0; i < missingCount; i++) {
              safeQuestion.options.push(`추가 옵션 ${i+1}`);
            }
          }

          // 정답 인덱스가 범위를 벗어나는 경우 조정
          if (safeQuestion.correctAnswerIndex >= safeQuestion.options.length) {
            safeQuestion.correctAnswerIndex = 0;
          }

          return safeQuestion;
        });
      }

      // 2. 소스 콘텐츠 확인 및 복구
      const sourceContent: Content = parsedQuiz.sourceContent && typeof parsedQuiz.sourceContent === 'object'
        ? {
            id: parsedQuiz.sourceContent.id || `source-${Date.now()}`,
            title: parsedQuiz.sourceContent.title || '복구된 출처 제목',
            source: parsedQuiz.sourceContent.source || '통일교육원',
            sourceUrl: parsedQuiz.sourceContent.sourceUrl || 'https://www.unikorea.go.kr/',
            contentType: (parsedQuiz.sourceContent.contentType as any) || 'article',
            snippet: parsedQuiz.sourceContent.snippet || '',
            imageUrl: parsedQuiz.sourceContent.imageUrl
          }
        : {
            id: 'default-source',
            title: '기본 출처',
            source: '통일교육원',
            sourceUrl: 'https://www.unikorea.go.kr/',
            contentType: 'article'
          };

      // 3. 대상 학년 확인 및 복구
      const targetGrade = Array.isArray(parsedQuiz.targetGrade) && parsedQuiz.targetGrade.length > 0
        ? parsedQuiz.targetGrade
        : ['elementary', 'middle', 'high'];

      // 모든 필수 필드가 포함된 안전한 퀴즈 객체 생성
      const safeQuiz: Quiz = {
        id: parsedQuiz.id || `quiz-${Date.now()}`,
        title: parsedQuiz.title || '제목 없는 퀴즈',
        description: parsedQuiz.description || '설명이 없는 퀴즈입니다.',
        questions: questions,
        category: parsedQuiz.category || 'unification_understanding',
        difficulty: (parsedQuiz.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        targetGrade: targetGrade,
        createdAt: parsedQuiz.createdAt || new Date().toISOString(),
        sourceContent: sourceContent
      };

      // 향상된 진단 로깅
      console.log('URL에서 퀴즈 데이터 복구 및 로드 완료:', {
        id: safeQuiz.id,
        title: safeQuiz.title,
        questionsCount: safeQuiz.questions.length,
        firstQuestion: safeQuiz.questions[0]?.question || 'No question available',
        category: safeQuiz.category,
        difficulty: safeQuiz.difficulty,
        options: safeQuiz.questions[0]?.options || [],
        sourceContentTitle: safeQuiz.sourceContent.title
      });

      setQuiz(safeQuiz);
    } catch (err) {
      console.error('퀴즈 데이터 처리 중 예상치 못한 오류:', err);
      setError('퀴즈 데이터 처리 중 오류가 발생했습니다. 올바른 링크를 사용해주세요.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

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
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            <p className="font-medium">퀴즈 로드 오류</p>
            <p>{error || '퀴즈를 찾을 수 없습니다.'}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/student" className="text-primary hover:underline">
              학생 페이지로 돌아가기
            </Link>
            <Link href="/" className="text-primary hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 문제가 없는 비정상적인 경우 처리
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md mb-6">
            <p className="font-medium">퀴즈 문제 없음</p>
            <p>이 퀴즈에는 문제가 없습니다. 올바른 링크를 사용해주세요.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/student" className="text-primary hover:underline">
              학생 페이지로 돌아가기
            </Link>
            <Link href="/" className="text-primary hover:underline">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <SharedQuizClient quiz={quiz} />;
}