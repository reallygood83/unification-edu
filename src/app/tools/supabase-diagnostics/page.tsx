'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Supabase 진단 페이지
 * 사용자가 Supabase 연결 상태를 확인할 수 있는 진단 도구 제공
 */
export default function SupabaseDiagnosticsPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/supabase-test');
      
      if (!response.ok) {
        throw new Error(`진단 API 오류: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 페이지 로드 시 자동으로 진단 실행
    runDiagnostics();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Supabase 연결 진단</h1>
      
      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? '진단 실행 중...' : '진단 다시 실행'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">오류 발생</p>
          <p>{error}</p>
        </div>
      )}
      
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">진단 실행 중...</p>
        </div>
      )}
      
      {results && !loading && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">진단 요약</h2>
            <div className={`p-4 rounded-md ${results.success ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <p className="font-bold">{results.success ? '✅ Supabase 설정이 정상입니다!' : '⚠️ Supabase 설정에 문제가 있습니다.'}</p>
              {!results.success && (
                <p className="mt-2">
                  아래 상세 진단 결과를 확인하고 <Link href="/SUPABASE_FULL_SETUP.md" className="text-blue-600 underline">설정 가이드</Link>에 따라 문제를 해결하세요.
                </p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">환경 변수 상태</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left">설정</th>
                    <th className="py-2 px-4 text-left">상태</th>
                    <th className="py-2 px-4 text-left">값 (부분)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-t">NEXT_PUBLIC_SUPABASE_URL</td>
                    <td className="py-2 px-4 border-t">
                      {results.configStatus.url ? '✅ 설정됨' : '❌ 미설정'}
                    </td>
                    <td className="py-2 px-4 border-t font-mono text-sm">
                      {results.configStatus.urlPrefix}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-t">NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
                    <td className="py-2 px-4 border-t">
                      {results.configStatus.anonKey ? '✅ 설정됨' : '❌ 미설정'}
                    </td>
                    <td className="py-2 px-4 border-t font-mono text-sm">
                      {results.configStatus.keyPrefix}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">연결 테스트</h2>
            <div className={`p-4 rounded-md ${results.diagnosticResults.connection.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-bold">
                {results.diagnosticResults.connection.success
                  ? '✅ 연결 성공'
                  : `❌ 연결 실패: ${results.diagnosticResults.connection.message}`}
              </p>
              
              {results.diagnosticResults.connection.details && (
                <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                  {JSON.stringify(results.diagnosticResults.connection.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">테이블 스키마 확인</h2>
            <div className={`p-4 rounded-md ${results.diagnosticResults.schema.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-bold">
                {results.diagnosticResults.schema.success
                  ? '✅ 테이블 스키마 정상'
                  : `❌ 스키마 오류: ${results.diagnosticResults.schema.message}`}
              </p>
              
              {results.diagnosticResults.schema.missingColumns && results.diagnosticResults.schema.missingColumns.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">누락된 컬럼:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {results.diagnosticResults.schema.missingColumns.map((col: string) => (
                      <li key={col}>{col}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t pt-4 mt-6">
            <h2 className="text-xl font-semibold mb-2">다음 단계</h2>
            
            {results.success ? (
              <div>
                <p className="mb-2">✅ 모든 설정이 올바르게 되어 있습니다!</p>
                <ul className="list-disc pl-5">
                  <li>
                    <Link href="/teacher/quiz/create" className="text-blue-600">
                      퀴즈 생성하기
                    </Link>
                  </li>
                  <li>
                    <Link href="/teacher/quiz/list" className="text-blue-600">
                      퀴즈 목록 보기
                    </Link>
                  </li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="mb-2">⚠️ 다음 단계를 통해 Supabase 설정을 완료하세요:</p>
                <ol className="list-decimal pl-5">
                  <li className="mb-1">
                    <Link href="/SUPABASE_FULL_SETUP.md" className="text-blue-600">
                      Supabase 설정 가이드
                    </Link>를 참고하여 데이터베이스 설정
                  </li>
                  <li className="mb-1">환경 변수 설정 확인 (.env.local 파일)</li>
                  <li className="mb-1">애플리케이션 재시작</li>
                  <li className="mb-1">진단 다시 실행</li>
                </ol>
              </div>
            )}
          </div>
          
          <div className="text-right text-xs text-gray-500 mt-4">
            진단 시간: {new Date(results.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}