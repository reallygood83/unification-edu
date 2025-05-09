import { getQuizById } from '@/lib/api-services';
import QuizClient from './QuizClient';

// Next.js 15 타입 문제 해결을 위해 최소한의 형태로 페이지 컴포넌트 정의
export default function Page({ params }) {
  // 퀴즈 ID 확인
  const quizId = params.id;

  // 로컬에서 퀴즈 데이터 가져오기 시도
  const localQuizData = getQuizById(quizId);

  // 클라이언트 컴포넌트로 데이터 전달
  return <QuizClient quizId={quizId} initialQuizData={localQuizData} />;
}
