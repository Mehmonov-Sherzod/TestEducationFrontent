// Question types based on backend models

export enum QuestionLevel {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export interface Question {
  id: string
  questionText: string
  image?: string
  questionLevel: QuestionLevel
  topicId?: string
  topicName?: string
  subjectName?: string
  translate?: QuestionTranslate[]
  answers: Answer[]
}

export interface Answer {
  id?: string
  answerText: string
  isCorrect: boolean
  translate?: AnswerTranslate[]
}

export interface QuestionTranslate {
  id?: string
  questionId?: string
  languageId?: number
  columnName: string
  translateText: string
}

export interface AnswerTranslate {
  id?: string
  answerId?: string
  languageId?: number
  columnName: string
  translateText: string
}

export interface CreateQuestionData {
  questionText: string
  topicId: string
  subjectId: string
  image?: File
  level: QuestionLevel
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
  id?: string
  text: string
  isCorrect: boolean
}

// Backend response model
export interface QuestionResponse {
  id?: string // lowercase from backend (Guid)
  Id?: string // PascalCase fallback
  QuestionText: string
  Image?: string
  QuestionLevel: QuestionLevel
  Translate?: QuestionTranslate[]
  Answers: AnswerResponse[]
}

export interface AnswerResponse {
  id?: string // lowercase from backend (Guid)
  Id?: string // PascalCase fallback
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
