export interface Test {
  id: number
  name: string
  subjectId: number
  durationMinutes: number
  userTests?: UserTest[]
}

export interface UserTest {
  id: number
  userId: number
  testId: number
  startedAt: string
  completedAt?: string
  userQuestions: UserQuestion[]
}

export interface UserQuestion {
  id: number
  userId: number
  userTestId: number
  questionId: number
  order: number
  answeredAt?: string
  userAnswers: UserQuestionAnswer[]
}

export interface UserQuestionAnswer {
  id: number
  order: number
  userQuestionId: number
  answerId: number
  isMarked: boolean
}

export interface UserTestResult {
  id: number
  userId: number
  subjectId: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  percentage: number
  timeTaken: number
  startedAt: string
  finishedAt: string
}

export interface TestSession {
  testId: number
  subjectId: number
  subjectName: string
  duration: number
  questions: Question[]
  currentQuestionIndex: number
  answers: Map<number, number[]>
  markedForReview: Set<number>
  startTime: Date
  timeRemaining: number
}

import { Question } from './question.types'
