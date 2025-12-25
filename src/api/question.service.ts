import api, { handleApiError } from './axios.config'
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionResponse,
  PageOption,
} from '@appTypes/question.types'

interface ApiResponse<T> {
  Succeeded: boolean
  Result: T
  Errors: string[]
}

interface PaginationResult<T> {
  Values: T[]
  PageNumber: number
  PageSize: number
  TotalCount: number
}

export const questionService = {
  /**
   * Get question by ID
   * GET /api/QuestionAnswer/{id}?lang=eng
   */
  getById: async (id: string, lang: string = 'uz'): Promise<ApiResponse<QuestionResponse>> => {
    return api.get(`/api/QuestionAnswer/${id}?lang=${lang}`)
  },

  /**
   * Get paginated questions
   * POST /api/QuestionAnswer/get-all-page?lang=uz&TopicId=guid&SubjectId=guid
   * SubjectId - required (Guid), filters by subject
   * TopicId - optional (Guid), empty Guid returns all questions in subject, otherwise filters by topic
   */
  getPaginated: async (
    pageOption: PageOption,
    lang: string = 'uz',
    subjectId: string,
    topicId?: string
  ): Promise<ApiResponse<PaginationResult<QuestionResponse>>> => {
    const emptyGuid = '00000000-0000-0000-0000-000000000000'
    const url = `/api/QuestionAnswer/get-all-page?lang=${lang}&TopicId=${topicId || emptyGuid}&SubjectId=${subjectId}`
    return api.post(url, {
      PageNumber: pageOption.pageNumber,
      PageSize: pageOption.pageSize,
      Search: pageOption.search || '',
    })
  },

  /**
   * Create question with answers
   * POST /api/QuestionAnswer
   */
  create: async (data: CreateQuestionData): Promise<ApiResponse<{ id: string }>> => {
    const formData = new FormData()

    // Convert QuestionLevel enum string to number for backend
    const levelMap: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 }
    const levelValue = levelMap[data.level] ?? 0

    formData.append('QuestionText', data.questionText)
    formData.append('TopicId', data.topicId)
    formData.append('SubjectId', data.subjectId)
    formData.append('Level', levelValue.toString())

    if (data.image) {
      formData.append('Image', data.image)
    }

    // Add answers
    data.answers.forEach((answer, index) => {
      formData.append(`Answers[${index}].Text`, answer.text)
      formData.append(`Answers[${index}].IsCorrect`, answer.isCorrect.toString())
    })

    return api.post('/api/QuestionAnswer', formData, {
      headers: {
        'Content-Type': undefined,
      },
    })
  },

  /**
   * Update question
   * PUT /api/QuestionAnswer/{id}
   */
  update: async (id: string, data: UpdateQuestionData): Promise<ApiResponse<{ id: string }>> => {
    const formData = new FormData()

    // Convert QuestionLevel enum string to number for backend
    const levelMap: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 }
    const levelValue = typeof data.level === 'string' ? (levelMap[data.level] ?? 0) : data.level

    formData.append('QuestionText', data.questionText)
    formData.append('Level', levelValue.toString())

    // Add answers
    data.answers.forEach((answer, index) => {
      formData.append(`Answers[${index}].Id`, answer.id || '00000000-0000-0000-0000-000000000000')
      formData.append(`Answers[${index}].Text`, answer.text)
      formData.append(`Answers[${index}].IsCorrect`, answer.isCorrect.toString())
    })

    return api.put(`/api/QuestionAnswer/${id}`, formData, {
      headers: {
        'Content-Type': undefined, // Let browser set multipart/form-data
      },
    })
  },

  /**
   * Delete question
   * DELETE /api/QuestionAnswer/{id}
   */
  delete: async (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/api/QuestionAnswer/${id}`)
  },

  /**
   * Get question image URL
   * If the image is already a full URL (from MinIO), return it directly
   * Otherwise, build the download URL through backend
   */
  getImageUrl: (image: string): string => {
    if (!image) return ''
    // If already a full URL, use directly
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image
    }
    // Otherwise, use backend download endpoint (empty in dev for proxy)
    const baseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001')
    return `${baseUrl}/api/QuestionAnswer/download?objectName=${encodeURIComponent(image)}`
  },
}

export { handleApiError }
