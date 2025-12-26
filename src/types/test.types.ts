export interface Test {
  id: number
  name: string
  subjectId: number
  durationMinutes: number
  userTests?: UserTest[]
}

// StartTestMixed30 API types
export interface StartTestMixed30Request {
  SubjectId: string
  TopicId?: string
}

export interface StartTestMixed30Response {
  Id: string
  UserId: string
  StartedAt: string
  EndsAt: string
  UserQuestions: UserQuestionResponse[]
}

export interface UserQuestionResponse {
  Id: string
  UserQuestionId: string
  QuestionText: string
  UserQuestionAnswers: UserQuestionAnswerResponse[]
}

export interface UserQuestionAnswerResponse {
  UserQuestionAnswerId: string
  AnswerText: string
  IsCorrect: boolean
  IsMarked: boolean
}

// FinishTest API types
export interface FinishTestRequest {
  TestProcessId: string
  userQuestionFinishes: UserQuestionFinish[]
}

export interface UserQuestionFinish {
  UserQuestionId: string
  MarkedAnsewrId: string
}

// FinishTest Response
export interface FinishTestResult {
  TotalQuestions: number
  Correct: number
  Incorrect: number
  PercentageOfCorrectAnswers: number
  TotalScore: number
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
