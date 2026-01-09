import api from './axios.config'
import { ApiResponse } from '@appTypes/api.types'

export interface GetMeaningResponse {
  OriginalText: string
  Meaning: string
}

export interface AiQuestion {
  Id: number
  Question: string
  Options: string[]
  CorrectIndex: number
}

export interface GenerateQuizResponse {
  OriginalText: string
  Meaning: string
  Questions: AiQuestion[]
}

export const aiService = {
  getMeaning: async (text: string): Promise<ApiResponse<GetMeaningResponse>> => {
    return api.post('/api/Ai/get-meaning', { Text: text })
  },

  generateQuiz: async (text: string, count: number = 10): Promise<ApiResponse<GenerateQuizResponse>> => {
    return api.post('/api/Ai/generate-quiz', { Text: text, Count: count })
  }
}
