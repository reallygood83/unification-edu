import { getQuizById } from '@/lib/api-services';
import QuizClient from './QuizClient';

// Next.js 15에서는 더 간단한 페이지 정의 사용
export default function Page({ params }: { params: { id: string } }) {
  // 퀴즈 데이터 가져오기
  const quizData = getQuizById(params.id);

  // 클라이언트 컴포넌트로 데이터 전달
  return <QuizClient quizId={params.id} initialQuizData={quizData} />;
}
