export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  selectedSubjects: string[];
  targetScore?: number;
  currentScore?: number;
  streak?: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cognitiveLevel: string;
}

export interface QuizAttempt {
  id: number;
  userId: number;
  startTime: Date;
  endTime?: Date;
  questions: Question[];
  score?: number;
}