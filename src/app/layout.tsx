import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import Navigation from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '통일교육 퀴즈 플랫폼',
  description: '통일교육 콘텐츠를 기반으로 AI가 생성하는 맞춤형 퀴즈 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Navigation />
        <main className="pb-12">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-6">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} 통일교육 퀴즈 플랫폼</p>
            <p className="mt-1">안양 박달초 김문정</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
