"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { StudentProgress } from '@/types';
import { generateCertificate } from '@/lib/api-services';
import html2canvas from 'html2canvas';

export default function CertificatePage() {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [certificateHtml, setCertificateHtml] = useState<string>('');
  
  const certificateRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 학생 진행 상황 로드
    const loadProgress = () => {
      setLoading(true);
      
      try {
        const savedProgress = localStorage.getItem('studentProgress');
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress) as StudentProgress;
          setProgress(parsedProgress);
          
          // 학생 이름 가져오기 (실제 구현에서는 사용자 정보에서 가져와야 함)
          const savedName = localStorage.getItem('studentName');
          setStudentName(savedName || '학생');
          
          // 인증서 획득 여부 확인
          if (!parsedProgress.certificateEarned) {
            setError('아직 인증서를 획득하지 못했습니다. 5일 연속으로 퀴즈를 완료하면 인증서를 획득할 수 있습니다.');
          } else {
            // 인증서 HTML 생성
            const html = generateCertificate(savedName || '학생');
            setCertificateHtml(html);
          }
        } else {
          setError('학습 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('진행 상황 로드 오류:', error);
        setError('데이터 로드 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProgress();
  }, []);
  
  // 인증서 저장
  const handleSaveCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = '통일교육_수료_인증서.png';
      link.click();
    } catch (error) {
      console.error('인증서 저장 오류:', error);
      alert('인증서 저장 중 오류가 발생했습니다.');
    }
  };
  
  // 인증서 학생 이름 변경
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentName(e.target.value);
    localStorage.setItem('studentName', e.target.value);
    
    // 인증서 HTML 업데이트
    const html = generateCertificate(e.target.value);
    setCertificateHtml(html);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">통일교육 수료 인증서</h1>
        <p className="text-gray-600 mb-6">
          통일교육 퀴즈 학습을 성공적으로 완료하고 획득한 인증서입니다.
        </p>
        
        <Link href="/student" className="text-primary hover:underline mb-6 inline-block">
          &larr; 학생 페이지로 돌아가기
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">인증서 정보를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">인증서를 표시할 수 없습니다</h2>
          <p className="mb-4">{error}</p>
          <Link href="/student" className="text-red-700 font-medium hover:underline">
            퀴즈 목록으로 돌아가기
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {/* 이름 설정 */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">인증서에 표시할 이름</label>
            <input
              type="text"
              value={studentName}
              onChange={handleNameChange}
              className="w-full max-w-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="이름을 입력하세요"
            />
          </div>
          
          {/* 인증서 */}
          <div className="mb-8 p-2 border border-gray-300 rounded-lg bg-white">
            <div 
              ref={certificateRef}
              className="certificate-container bg-white relative p-10 rounded-lg shadow-sm"
              style={{ 
                backgroundImage: 'linear-gradient(135deg, rgba(240,240,255,0.2) 0%, rgba(255,255,255,1) 100%)',
                minHeight: '600px'
              }}
            >
              {/* 인증서 배경 테두리 */}
              <div className="absolute inset-0 border-8 border-double border-gray-200 m-4 pointer-events-none"></div>
              
              {/* 인증서 헤더 */}
              <div className="text-center mb-6 relative">
                <h2 className="text-3xl font-serif font-bold text-gray-800">통일교육 수료 인증서</h2>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-24 h-1 bg-primary mt-2"></div>
              </div>
              
              {/* 인증서 내용 */}
              <div className="py-10 text-center">
                <div className="mb-8">
                  <p className="text-xl text-gray-700 mb-2">이 인증서는</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{studentName}</p>
                  <p className="text-xl text-gray-700">학생이</p>
                </div>
                
                <div className="mb-8">
                  <p className="text-xl text-gray-700">
                    통일교육 퀴즈 프로그램을 성공적으로 완료했음을 증명합니다.
                  </p>
                </div>
                
                <div className="mb-4">
                  <p className="text-lg text-gray-600">
                    해당 학생은 5일 연속으로 통일교육 퀴즈를 완료하여<br />
                    한반도의 평화와 통일에 대한 이해도를 높였습니다.
                  </p>
                </div>
              </div>
              
              {/* 발급 정보 */}
              <div className="absolute bottom-10 left-0 right-0 flex justify-between px-12">
                <div>
                  <p className="text-sm text-gray-600">발급일: {new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">인증번호: UNIF-{Date.now().toString().slice(-8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-2">통일교육원</p>
                  <div className="w-20 h-20 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-primary/20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 버튼 */}
          <div className="flex justify-center">
            <button
              onClick={handleSaveCertificate}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              인증서 이미지로 저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
