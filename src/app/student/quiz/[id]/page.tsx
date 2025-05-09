import { getQuizById } from '@/lib/api-services';
import QuizClient from './QuizClient';

// Next.js 15 App Router 규칙에 맞게 타입 정의 수정
type Props = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default function StudentQuizPage({ params }: Props) {
  // 퀴즈 데이터 가져오기
  const quizData = getQuizById(params.id);

  // 클라이언트 컴포넌트로 데이터 전달
  return <QuizClient quizId={params.id} initialQuizData={quizData} />;
}
