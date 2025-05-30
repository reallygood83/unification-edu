import { Quiz, QuizAttempt, StudentProgress } from '@/types';
import { getSupabase } from './supabase';

// UUID 헬퍼 함수 - 표준 UUID v4 형식의 문자열 생성
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 기존 ID를 Supabase UUID 형식으로 변환
function convertToUUID(id: string): string {
  // 이미 UUID 형식이면 그대로 반환
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }

  // 아니면 새 UUID 생성
  return generateUUID();
}

/**
 * DB에 새 퀴즈 저장
 * 성공 시 저장된 퀴즈 ID 반환, 실패 시 null 반환
 */
export async function saveQuizToDB(quiz: Quiz): Promise<string | null> {
  try {
    // UUID 형식으로 ID 변환 또는 신규 생성
    const uuid = quiz.id ? convertToUUID(quiz.id) : generateUUID();

    // 데이터베이스 형식에 맞게 변환
    const dbQuiz = {
      id: uuid,
      title: quiz.title || '제목 없는 퀴즈',
      description: quiz.description || '',
      category: quiz.category || 'unification_understanding',
      difficulty: quiz.difficulty || 'medium',
      questions: Array.isArray(quiz.questions) ? quiz.questions : [],
      source_content: quiz.sourceContent || null,
      target_grade: Array.isArray(quiz.targetGrade) ? quiz.targetGrade : ['elementary', 'middle', 'high'],
      created_at: new Date().toISOString()
    };

    // Supabase 클라이언트 가져오기
    const supabase = await getSupabase();
    if (!supabase) {
      console.error('Supabase 클라이언트를 초기화할 수 없습니다.');
      return null;
    }

    console.log('Supabase에 퀴즈 저장 시도 - UUID:', uuid);

    // Supabase에 퀴즈 저장
    const { data, error } = await supabase
      .from('quizzes')
      .insert([dbQuiz])
      .select('id')
      .single();

    if (error) {
      console.error('퀴즈 저장 오류 (DB):', error.message);
      // 기존 ID를 유지한 채 로컬 스토리지에만 저장
      saveQuizToLocalStorage(quiz);
      return null;
    }

    console.log('퀴즈가 DB에 성공적으로 저장되었습니다:', data.id);

    // 백워드 호환성: 로컬 스토리지에도 퀴즈 저장 (UUID로 업데이트된 버전)
    const updatedQuiz = {...quiz, id: uuid};
    saveQuizToLocalStorage(updatedQuiz);

    return data.id;
  } catch (error) {
    console.error('퀴즈 저장 중 예외 발생:', error);
    // 오류 발생 시 로컬 스토리지에만 저장
    saveQuizToLocalStorage(quiz);
    return null;
  }
}

/**
 * 이전 버전과의 호환성을 위해 로컬 스토리지에도 퀴즈 저장
 */
function saveQuizToLocalStorage(quiz: Quiz): boolean {
  try {
    // 기존 퀴즈 목록 가져오기
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    
    // 새 퀴즈 추가
    savedQuizzes.push(quiz);
    
    // localStorage에 저장
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
    
    // 쿠키에도 저장 (서버 사이드에서 접근 가능하도록)
    if (typeof document !== 'undefined') {
      document.cookie = `savedQuizzes=${encodeURIComponent(JSON.stringify(savedQuizzes))}; path=/; max-age=86400`;
    }
    
    return true;
  } catch (error) {
    console.error('로컬 스토리지 퀴즈 저장 오류:', error);
    return false;
  }
}

/**
 * DB에서 모든 퀴즈 가져오기
 */
export async function getAllQuizzesFromDB(): Promise<Quiz[]> {
  try {
    // Supabase 클라이언트 가져오기
    const supabase = await getSupabase();
    if (!supabase) {
      console.error('Supabase 클라이언트를 초기화할 수 없습니다.');
      return getAllQuizzesFromLocalStorage();
    }

    // Supabase에서 모든 퀴즈 조회
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('퀴즈 조회 오류 (DB):', error.message);
      // 로컬 스토리지에서 대체
      return getAllQuizzesFromLocalStorage();
    }

    if (!data || data.length === 0) {
      console.log('DB에 저장된 퀴즈가 없습니다. 로컬 스토리지 확인...');
      return getAllQuizzesFromLocalStorage();
    }

    // DB 형식을 앱 형식으로 변환
    const quizzes: Quiz[] = data.map(item => {
      // 각 필드에 대해 유효성 검사 및 기본값 설정
      const safeQuiz: Quiz = {
        id: item.id || `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title || '제목 없는 퀴즈',
        description: item.description || '설명이 없는 퀴즈입니다.',
        category: item.category || 'unification_understanding',
        difficulty: (item.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        // 문제 배열이 없거나 유효하지 않은 경우 빈 배열로 초기화
        questions: Array.isArray(item.questions) ? item.questions.map((q, index) => ({
          id: q?.id || `q-${Date.now()}-${index}`,
          question: q?.question || `문제 #${index+1}`,
          options: Array.isArray(q?.options) ? q.options : ['옵션 1', '옵션 2', '옵션 3', '옵션 4'],
          correctAnswerIndex: typeof q?.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
          explanation: q?.explanation || '설명이 제공되지 않았습니다.'
        })) : [],
        // sourceContent가 없거나 유효하지 않은 경우 기본값 설정
        sourceContent: item.source_content ? {
          id: item.source_content.id || 'default-source',
          title: item.source_content.title || '기본 출처',
          source: item.source_content.source || '통일교육원',
          sourceUrl: item.source_content.sourceUrl || 'https://www.unikorea.go.kr/',
          contentType: item.source_content.contentType || 'article'
        } : {
          id: 'default-source',
          title: '기본 출처',
          source: '통일교육원',
          sourceUrl: 'https://www.unikorea.go.kr/',
          contentType: 'article'
        },
        targetGrade: Array.isArray(item.target_grade) ? item.target_grade : ['elementary', 'middle', 'high'],
        createdAt: item.created_at || new Date().toISOString()
      };
      return safeQuiz;
    });

    console.log(`DB에서 ${quizzes.length}개의 퀴즈를 로드했습니다.`);
    return quizzes;
  } catch (error) {
    console.error('DB 퀴즈 조회 중 예외 발생:', error);
    // 오류 발생 시 로컬 스토리지에서 대체
    return getAllQuizzesFromLocalStorage();
  }
}

/**
 * 로컬 스토리지에서 모든 퀴즈 가져오기
 */
function getAllQuizzesFromLocalStorage(): Quiz[] {
  try {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    console.log(`로컬 스토리지에서 ${savedQuizzes.length}개의 퀴즈를 로드했습니다.`);
    return savedQuizzes;
  } catch (error) {
    console.error('로컬 스토리지 퀴즈 조회 오류:', error);
    return [];
  }
}

/**
 * ID로 DB에서 특정 퀴즈 가져오기
 */
export async function getQuizByIdFromDB(id: string): Promise<Quiz | null> {
  try {
    if (!id) {
      console.error('유효하지 않은 퀴즈 ID로 조회 요청됨');
      return null;
    }

    // Supabase 클라이언트 가져오기
    const supabase = await getSupabase();
    if (!supabase) {
      console.error('Supabase 클라이언트를 초기화할 수 없습니다.');
      return getQuizByIdFromLocalStorage(id);
    }

    // Supabase에서 ID로 퀴즈 조회
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`ID ${id}로 퀴즈 조회 오류 (DB):`, error.message);
      // 로컬 스토리지에서 대체
      return getQuizByIdFromLocalStorage(id);
    }

    if (!data) {
      console.log(`ID ${id}의 퀴즈를 DB에서 찾을 수 없습니다. 로컬 스토리지 확인...`);
      return getQuizByIdFromLocalStorage(id);
    }

    // DB 형식을 앱 형식으로 변환 - 더 강화된 null 체크와 기본값 추가
    const quiz: Quiz = {
      id: data.id || `quiz-${Date.now()}`,
      title: data.title || '제목 없는 퀴즈',
      description: data.description || '설명이 없는 퀴즈입니다.',
      category: data.category || 'unification_understanding',
      difficulty: (data.difficulty as 'easy' | 'medium' | 'hard') || 'medium',
      // 문제 배열이 없거나 유효하지 않은 경우 빈 배열로 초기화
      questions: Array.isArray(data.questions) ? data.questions.map((q, index) => ({
        id: q?.id || `q-${Date.now()}-${index}`,
        question: q?.question || `문제 #${index+1}`,
        options: Array.isArray(q?.options) ? q.options : ['옵션 1', '옵션 2', '옵션 3', '옵션 4'],
        correctAnswerIndex: typeof q?.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
        explanation: q?.explanation || '설명이 제공되지 않았습니다.'
      })) : [],
      // sourceContent가 없거나 유효하지 않은 경우 기본값 설정
      sourceContent: data.source_content ? {
        id: data.source_content.id || 'default-source',
        title: data.source_content.title || '기본 출처',
        source: data.source_content.source || '통일교육원',
        sourceUrl: data.source_content.sourceUrl || 'https://www.unikorea.go.kr/',
        contentType: data.source_content.contentType || 'article'
      } : {
        id: 'default-source',
        title: '기본 출처',
        source: '통일교육원',
        sourceUrl: 'https://www.unikorea.go.kr/',
        contentType: 'article'
      },
      targetGrade: Array.isArray(data.target_grade) ? data.target_grade : ['elementary', 'middle', 'high'],
      createdAt: data.created_at || new Date().toISOString()
    };

    console.log(`DB에서 퀴즈 "${quiz.title}"를 로드했습니다.`);
    return quiz;
  } catch (error) {
    console.error(`ID ${id}로 DB 퀴즈 조회 중 예외 발생:`, error);
    // 오류 발생 시 로컬 스토리지에서 대체
    return getQuizByIdFromLocalStorage(id);
  }
}

/**
 * ID로 로컬 스토리지에서 특정 퀴즈 가져오기
 */
function getQuizByIdFromLocalStorage(id: string): Quiz | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const savedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
    const quiz = savedQuizzes.find((q: Quiz) => q.id === id);
    return quiz || null;
  } catch (error) {
    console.error('로컬 스토리지에서 퀴즈 조회 오류:', error);
    return null;
  }
}

/**
 * 학생 진행 상황 저장 또는 업데이트
 */
export async function saveStudentProgressToDB(progress: StudentProgress): Promise<boolean> {
  try {
    // UUID 형식으로 ID 변환 또는 신규 생성
    const uuid = progress.id ? convertToUUID(progress.id) : generateUUID();

    // DB 형식으로 변환
    const dbProgress = {
      id: uuid,
      user_id: progress.userId || `user-${Date.now()}`,
      streak_count: progress.streakCount || 0,
      last_completed_date: progress.lastCompletedDate || null,
      completed_days: progress.completedDays || 0,
      certificate_earned: progress.certificateEarned || false,
      quiz_attempts: Array.isArray(progress.quizAttempts) ? progress.quizAttempts : []
    };

    // Supabase 클라이언트 가져오기
    const supabase = await getSupabase();
    if (!supabase) {
      console.error('Supabase 클라이언트를 초기화할 수 없습니다.');
      saveStudentProgressToLocalStorage({...progress, id: uuid});
      return false;
    }

    console.log('Supabase에 학생 진행 상황 저장 시도 - UUID:', uuid);

    // 기존 데이터 있는지 확인
    const { data: existingData } = await supabase
      .from('student_progress')
      .select('id')
      .eq('user_id', progress.userId)
      .maybeSingle();

    let result;

    if (existingData) {
      // 업데이트
      result = await supabase
        .from('student_progress')
        .update(dbProgress)
        .eq('id', existingData.id);
    } else {
      // 새로 생성
      result = await supabase
        .from('student_progress')
        .insert([dbProgress]);
    }

    if (result.error) {
      console.error('진행 상황 저장 오류 (DB):', result.error.message);
      // 로컬 스토리지에 백업
      saveStudentProgressToLocalStorage({...progress, id: uuid});
      return false;
    }

    console.log('학생 진행 상황이 DB에 성공적으로 저장되었습니다.');
    // 로컬 스토리지에도 저장 (백워드 호환성)
    saveStudentProgressToLocalStorage({...progress, id: uuid});
    return true;
  } catch (error) {
    console.error('진행 상황 저장 중 예외 발생:', error);
    // 로컬 스토리지에 백업
    saveStudentProgressToLocalStorage(progress);
    return false;
  }
}

/**
 * 학생 진행 상황을 로컬 스토리지에 저장
 */
function saveStudentProgressToLocalStorage(progress: StudentProgress): boolean {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    localStorage.setItem('studentProgress', JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('로컬 스토리지 진행 상황 저장 오류:', error);
    return false;
  }
}

/**
 * 학생 진행 상황 가져오기 
 */
export async function getStudentProgressFromDB(userId: string): Promise<StudentProgress | null> {
  try {
    // Supabase 클라이언트 가져오기
    const supabase = await getSupabase();
    if (!supabase) {
      console.error('Supabase 클라이언트를 초기화할 수 없습니다.');
      return getStudentProgressFromLocalStorage();
    }

    // Supabase에서 학생 진행 상황 조회
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('학생 진행 상황 조회 오류 (DB):', error.message);
      // 로컬에서 대체
      return getStudentProgressFromLocalStorage();
    }
    
    if (!data) {
      console.log('DB에서 학생 진행 상황을 찾을 수 없습니다. 로컬 스토리지 확인...');
      return getStudentProgressFromLocalStorage();
    }
    
    // DB 형식을 앱 형식으로 변환
    const progress: StudentProgress = {
      id: data.id,
      userId: data.user_id,
      streakCount: data.streak_count,
      lastCompletedDate: data.last_completed_date,
      completedDays: data.completed_days,
      certificateEarned: data.certificate_earned,
      quizAttempts: data.quiz_attempts
    };
    
    console.log('DB에서 학생 진행 상황을 로드했습니다.');
    return progress;
  } catch (error) {
    console.error('DB 학생 진행 상황 조회 중 예외 발생:', error);
    // 로컬에서 대체
    return getStudentProgressFromLocalStorage();
  }
}

/**
 * 로컬 스토리지에서 학생 진행 상황 가져오기
 */
function getStudentProgressFromLocalStorage(): StudentProgress | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const savedProgress = localStorage.getItem('studentProgress');
    if (!savedProgress) {
      return null;
    }
    return JSON.parse(savedProgress);
  } catch (error) {
    console.error('로컬 스토리지 진행 상황 조회 오류:', error);
    return null;
  }
}