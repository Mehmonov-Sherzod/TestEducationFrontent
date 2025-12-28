import api from './axios.config'

interface ApiResponse<T> {
  Succeeded: boolean
  Result: T
  Errors: string[]
}

interface PagedRequest {
  PageNumber: number
  PageSize: number
  Search?: string
}

interface TestResultItem {
  TotalQuestions: number
  CorrectAnswers: number
  IncorrectAnswers: number
  PercentageOfCorrectAnswers: number
  TotalScore: number
}

interface PagedTestResultResponse {
  Values: TestResultItem[]
  PageNumber: number
  PageSize: number
  TotalCount: number
  HasPrevious: boolean
  HasNext: boolean
}

export const resultService = {
  /**
   * Get paginated test results for current user
   * POST /api/ResultTest/test-result
   */
  getPagedMyTestResults: async (data: PagedRequest): Promise<ApiResponse<PagedTestResultResponse>> => {
    return api.post('/api/ResultTest/test-result', data)
  },
}
