import { getQuizById } from '@/lib/api-services';
import QuizClient from './QuizClient';

// 서버 컴포넌트로 변경 (Next.js 15 규칙)
export default async function StudentQuizPage({
  params,
}: {
  params: { id: string }
}) {
  // 서버에서 퀴즈 데이터 가져오기
  const quizData = getQuizById(params.id);

  // 클라이언트 컴포넌트로 데이터 전달
  return <QuizClient quizId={params.id} initialQuizData={quizData} />;
}
