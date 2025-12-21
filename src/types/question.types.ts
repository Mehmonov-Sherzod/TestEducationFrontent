// Question types based on backend models

export enum QuestionLevel {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Question {
  id: number
  questionText: string
  image?: string
  questionLevel: QuestionLevel
  topicId?: number
  topicName?: string
  subjectName?: string
  translate?: QuestionTranslate[]
  answers: Answer[]
}

export interface Answer {
  id?: number
  answerText: string
  isCorrect: boolean
  translate?: AnswerTranslate[]
}

export interface QuestionTranslate {
  id?: number
  questionId?: number
  languageId?: number
  columnName: string
  translateText: string
}

export interface AnswerTranslate {
  id?: number
  answerId?: number
  languageId?: number
  columnName: string
  translateText: string
}

export interface CreateQuestionData {
  questionText: string
  topicId: string
  image?: File
  level: QuestionLevel
  translate?: CreateQuestionTranslate[]
  answers: CreateAnswerData[]
}

export interface CreateQuestionTranslate {
  languageId: number
  columnName: string
  translateText: string
}

export interface CreateAnswerData {
  text: string
  isCorrect: boolean
  translate?: CreateAnswerTranslate[]
}

export interface CreateAnswerTranslate {
  languageId: number
  columnName: string
  translateText: string
}

export interface UpdateQuestionData {
  questionText: string
  level: QuestionLevel
  answers: UpdateAnswerData[]
}

export interface UpdateAnswerData {
  id?: number
  text: string
  isCorrect: boolean
}

// Backend response model
export interface QuestionResponse {
  id?: number // lowercase from backend
  Id?: number // PascalCase fallback
  QuestionText: string
  Image?: string
  QuestionLevel: QuestionLevel
  Translate?: QuestionTranslate[]
  Answers: AnswerResponse[]
}

export interface AnswerResponse {
  id?: number // lowercase from backend
  Id?: number // PascalCase fallback
  AnswerText: string
  IsCorrect?: boolean
  isCorrect?: boolean // lowercase fallback
  Translate?: AnswerTranslate[]
}

export interface PageOption {
  pageNumber: number
  pageSize: number
  search?: string
}
