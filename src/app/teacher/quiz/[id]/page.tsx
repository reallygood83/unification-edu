import { getQuizByIdSync } from '@/lib/api-services';
import QuizDetailClient from './QuizDetailClient';

// 교사용 퀴즈 상세 페이지 (서버 컴포넌트)
export default function Page({ params }) {
  // 퀴즈 ID 확인
  const quizId = params.id;

  // 로컬에서 퀴즈 데이터 가져오기 시도 (동기식 버전 사용)
  const localQuizData = getQuizByIdSync(quizId);

  // 클라이언트 컴포넌트로 데이터 전달
  return <QuizDetailClient quizId={quizId} initialQuizData={localQuizData} />;
}