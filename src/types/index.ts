export interface Category {
  id: string;
  name: string;
  description: string;
  gradeLevel: GradeLevel[];
  keywords: string[];
}

export type GradeLevel = 'elementary' | 'middle' | 'high';

export interface Content {
  id: string;
  title: string;
  snippet: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt?: string;
  contentType: 'article' | 'video' | 'news';
  rawText?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  category: string;
  sourceContent: Content;
  createdAt: string;
  createdBy?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  targetGrade: GradeLevel[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  date: string;
  answers: number[];
  timeSpent: number;
}

export interface StudentProgress {
  id: string;
  userId: string;
  completedDays: number;
  lastCompletedDate: string;
  quizAttempts: QuizAttempt[];
  certificateEarned: boolean;
  streakCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  school?: string;
  gradeLevel?: GradeLevel;
  createdAt: string;
}

export interface PerplexitySearchResponse {
  results: Array<{
    id: string;
    title: string;
    url: string;
    snippet: string;
    source: string;
    imageUrl?: string;
    publishedDate?: string;
  }>;
  query: string;
}
