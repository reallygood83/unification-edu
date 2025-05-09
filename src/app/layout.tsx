import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

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
        {children}
      </body>
    </html>
  );
}
