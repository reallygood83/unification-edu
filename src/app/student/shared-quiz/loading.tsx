export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      <p className="mt-2 text-gray-600">퀴즈를 불러오는 중...</p>
    </div>
  );
}