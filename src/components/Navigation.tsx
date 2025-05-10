"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);

  // 현재 경로에 따라 사용자 역할 감지
  useEffect(() => {
    if (pathname?.includes('/teacher')) {
      setUserRole('teacher');
    } else if (pathname?.includes('/student')) {
      setUserRole('student');
    } else {
      setUserRole(null);
    }
  }, [pathname]);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 사이트명 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">통일교육</span>
              <span className="ml-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                {userRole === 'teacher' ? '교사용' : userRole === 'student' ? '학생용' : '플랫폼'}
              </span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-gray-600 hover:text-primary ${pathname === '/' ? 'font-semibold' : ''}`}
            >
              홈
            </Link>
            <Link 
              href="/teacher" 
              className={`text-gray-600 hover:text-primary ${pathname?.includes('/teacher') ? 'font-semibold' : ''}`}
            >
              교사용
            </Link>
            <Link 
              href="/student" 
              className={`text-gray-600 hover:text-primary ${pathname?.includes('/student') ? 'font-semibold' : ''}`}
            >
              학생용
            </Link>
            
            {/* 사용자 역할에 따라 추가 메뉴 표시 */}
            {userRole === 'teacher' && (
              <>
                <Link 
                  href="/teacher/quiz/list" 
                  className={`text-gray-600 hover:text-primary ${pathname?.includes('/teacher/quiz/list') ? 'font-semibold' : ''}`}
                >
                  내 퀴즈 목록
                </Link>
              </>
            )}
            
            {userRole === 'student' && (
              <>
                <Link 
                  href="/student/history" 
                  className={`text-gray-600 hover:text-primary ${pathname?.includes('/student/history') ? 'font-semibold' : ''}`}
                >
                  학습 기록
                </Link>
                {/* 인증서 링크는 실제로는 조건부로 보여야 함 */}
                <Link 
                  href="/student/certificate" 
                  className={`text-gray-600 hover:text-primary ${pathname?.includes('/student/certificate') ? 'font-semibold' : ''}`}
                >
                  인증서
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 토글 버튼 */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary focus:outline-none"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} py-4`}>
          <div className="flex flex-col space-y-3">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md ${pathname === '/' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              홈
            </Link>
            <Link 
              href="/teacher" 
              className={`px-3 py-2 rounded-md ${pathname?.includes('/teacher') && !pathname?.includes('/teacher/quiz') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              교사용
            </Link>
            <Link 
              href="/student" 
              className={`px-3 py-2 rounded-md ${pathname?.includes('/student') && !pathname?.includes('/student/history') && !pathname?.includes('/student/certificate') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              학생용
            </Link>
            
            {/* 교사 역할 메뉴 */}
            {userRole === 'teacher' && (
              <Link 
                href="/teacher/quiz/list" 
                className={`px-3 py-2 rounded-md ${pathname?.includes('/teacher/quiz/list') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                내 퀴즈 목록
              </Link>
            )}
            
            {/* 학생 역할 메뉴 */}
            {userRole === 'student' && (
              <>
                <Link 
                  href="/student/history" 
                  className={`px-3 py-2 rounded-md ${pathname?.includes('/student/history') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  학습 기록
                </Link>
                <Link 
                  href="/student/certificate" 
                  className={`px-3 py-2 rounded-md ${pathname?.includes('/student/certificate') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  인증서
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}