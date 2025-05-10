import { Suspense } from 'react';
import SharedQuizContent from './SharedQuizContent';
import Loading from './loading';

export default function SharedQuizPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SharedQuizContent />
    </Suspense>
  );
}