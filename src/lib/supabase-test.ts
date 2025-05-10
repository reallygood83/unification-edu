import { getSupabase } from './supabase';

/**
 * Supabase 연결 및 데이터베이스 테이블 테스트 유틸리티
 * 
 * 이 유틸리티를 사용하여 Supabase 연결 상태를 진단하고 테이블 설정을 확인할 수 있습니다.
 * 개발 환경에서 문제를 진단할 때 유용합니다.
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('Supabase 연결 테스트 시작...');
    
    // 1. 클라이언트 초기화 확인
    const supabase = await getSupabase();
    if (!supabase) {
      return {
        success: false,
        message: 'Supabase 클라이언트 초기화 실패',
        details: '클라이언트 객체가 생성되지 않았습니다. 환경 변수를 확인하세요.'
      };
    }
    
    // 2. quizzes 테이블 접근 테스트
    const { data: quizzesData, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1);
      
    if (quizzesError) {
      return {
        success: false,
        message: 'quizzes 테이블 접근 실패',
        details: {
          error: quizzesError,
          suggestion: 'SQL 설정 스크립트를 실행했는지 확인하세요. (SUPABASE_FULL_SETUP.md 참조)'
        }
      };
    }
    
    // 3. student_progress 테이블 접근 테스트
    const { data: progressData, error: progressError } = await supabase
      .from('student_progress')
      .select('id')
      .limit(1);
      
    if (progressError) {
      return {
        success: false,
        message: 'student_progress 테이블 접근 실패',
        details: {
          error: progressError,
          suggestion: 'SQL 설정 스크립트를 실행했는지 확인하세요. (SUPABASE_FULL_SETUP.md 참조)'
        }
      };
    }
    
    // 4. RLS 정책 테스트 (INSERT 테스트)
    const testId = 'test-' + Date.now();
    const { error: insertError } = await supabase
      .from('quizzes')
      .insert({
        id: testId,
        title: '테스트 퀴즈',
        description: '자동 테스트를 위한 임시 퀴즈입니다.',
        category: 'test',
        difficulty: 'easy',
        questions: [{ 
          id: 'q-test', 
          question: '테스트 질문입니다.', 
          options: ['A', 'B', 'C', 'D'], 
          correctAnswerIndex: 0,
          explanation: '테스트 설명'
        }],
        target_grade: ['elementary']
      });
      
    if (insertError) {
      return {
        success: false,
        message: 'INSERT 권한 테스트 실패',
        details: {
          error: insertError,
          suggestion: 'RLS 정책이 올바르게 설정되었는지 확인하세요.'
        }
      };
    }
    
    // 5. 성공한 경우 테스트 데이터 삭제
    await supabase
      .from('quizzes')
      .delete()
      .eq('id', testId);
    
    // 모든 테스트 통과
    return {
      success: true,
      message: 'Supabase 연결 및 테이블 접근 테스트 성공!',
      details: {
        quizzesCount: quizzesData?.length || 0,
        progressCount: progressData?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Supabase 테스트 중 예외 발생',
      details: error
    };
  }
}

/**
 * 테이블 스키마 확인 테스트
 * quizzes 테이블에 필요한 모든 컬럼이 존재하는지 확인
 */
export async function testTableSchema(): Promise<{
  success: boolean;
  message: string;
  missingColumns?: string[];
}> {
  try {
    console.log('테이블 스키마 확인 테스트 시작...');
    
    const supabase = await getSupabase();
    if (!supabase) {
      return {
        success: false,
        message: 'Supabase 클라이언트 초기화 실패'
      };
    }
    
    // 필요한 컬럼 리스트
    const requiredColumns = [
      'id', 'title', 'description', 'category', 'difficulty',
      'questions', 'source_content', 'target_grade', 'created_at'
    ];
    
    // 첫 번째 쿼리로 테이블 자체 존재 확인
    const { error: tableError } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1);
      
    if (tableError && tableError.message.includes('does not exist')) {
      return {
        success: false,
        message: 'quizzes 테이블이 존재하지 않습니다.',
        missingColumns: requiredColumns
      };
    }
    
    // 각 컬럼에 대해 별도로 쿼리 실행하여 존재 여부 확인
    const missingColumns: string[] = [];
    
    for (const column of requiredColumns) {
      // 컬럼을 하나만 선택하는 쿼리 시도
      const { error } = await supabase
        .from('quizzes')
        .select(column)
        .limit(1);
        
      if (error && (error.message.includes('column') || error.message.includes('does not exist'))) {
        missingColumns.push(column);
      }
    }
    
    if (missingColumns.length > 0) {
      return {
        success: false,
        message: `quizzes 테이블에 필요한 컬럼이 누락되었습니다.`,
        missingColumns
      };
    }
    
    return {
      success: true,
      message: '테이블 스키마가 올바르게 설정되었습니다.'
    };
  } catch (error) {
    return {
      success: false,
      message: '테이블 스키마 확인 중 오류 발생',
      missingColumns: []
    };
  }
}

/**
 * 전체 Supabase 진단 실행
 * 연결, 테이블, 스키마를 모두 확인
 */
export async function runSupabaseDiagnostics(): Promise<{
  connection: ReturnType<typeof testSupabaseConnection>;
  schema: ReturnType<typeof testTableSchema>;
  overallSuccess: boolean;
}> {
  const connectionTest = await testSupabaseConnection();
  const schemaTest = await testTableSchema();
  
  return {
    connection: connectionTest,
    schema: schemaTest,
    overallSuccess: connectionTest.success && schemaTest.success
  };
}