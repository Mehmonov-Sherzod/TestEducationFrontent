export interface Subject {
  id: number
  subjectName: string
  translates?: SubjectTranslate[]
}

export interface SubjectTranslate {
  id: number
  subjectId: number
  languageId: number
  columnName: string
  translateText: string
}

export interface CreateSubjectData {
  name: string
  subjectTranslates: CreateSubjectTranslate[]
}

export interface CreateSubjectTranslate {
  languageId: number
  columnName: string
  translateText: string
}

export interface UpdateSubjectData {
  subjectName: string
  updateSubjectTranslateModels: UpdateSubjectTranslate[]
}

export interface UpdateSubjectTranslate {
  id?: number
  languageId: number
  columnName: string
  translateText: string
}

export interface SubjectResponse {
  subjectName: string
  translates: SubjectTranslate[]
}

export enum Language {
  Uzbek = 1,
  Russian = 2,
  English = 3,
}

export const LanguageCode = {
  [Language.Uzbek]: 'uz',
  [Language.Russian]: 'rus',
  [Language.English]: 'eng',
} as const
