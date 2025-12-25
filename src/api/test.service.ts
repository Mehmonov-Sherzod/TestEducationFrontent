import api from './axios.config'
import { StartTestMixed30Request, StartTestMixed30Response } from '@appTypes/test.types'

interface ApiResponse<T> {
  Succeeded: boolean
  Result: T
  Errors: string[]
}

export const testService = {
  /**
   * Start Mixed Test with 30 questions (10 Easy, 10 Medium, 10 Hard)
   * POST /api/StartTest/start-test-mixed30
   */
  startTestMixed30: async (data: StartTestMixed30Request): Promise<ApiResponse<StartTestMixed30Response>> => {
    return api.post('/api/StartTest/start-test-mixed30', data)
  },
}
