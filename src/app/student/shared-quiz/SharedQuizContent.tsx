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
      // Base64로 인코딩된 데이터를 디코딩하고 JSON으로 파싱
      const decodedData = atob(data);
      const parsedQuiz = JSON.parse(decodedData) as Quiz;
      
      if (!parsedQuiz || !parsedQuiz.questions || !Array.isArray(parsedQuiz.questions)) {
        throw new Error('유효하지 않은 퀴즈 데이터입니다.');
      }
      
      console.log('URL에서 퀴즈 데이터 로드 성공:', parsedQuiz.title);
      setQuiz(parsedQuiz);
    } catch (err) {
      console.error('퀴즈 데이터 파싱 오류:', err);
      setError('유효하지 않은 퀴즈 데이터입니다. 올바른 링크를 사용해주세요.');
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

  return <SharedQuizClient quiz={quiz} />;
}