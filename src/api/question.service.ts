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
  getById: async (id: number, lang: string = 'uz'): Promise<ApiResponse<QuestionResponse>> => {
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
  create: async (data: CreateQuestionData): Promise<ApiResponse<{ id: number }>> => {
    const formData = new FormData()

    // Convert QuestionLevel enum string to number for backend
    const levelMap: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 }
    const levelValue = levelMap[data.level] ?? 0

    formData.append('QuestionText', data.questionText)
    formData.append('TopicId', data.topicId.toString())
    formData.append('Level', levelValue.toString())

    if (data.image) {
      formData.append('Image', data.image)
    }

    // Add translations - always required by backend
    // Language enum: uz=0, rus=1, eng=2
    if (data.translate && data.translate.length > 0) {
      data.translate.forEach((t, index) => {
        formData.append(`Translate[${index}].LanguageId`, t.languageId.toString())
        formData.append(`Translate[${index}].ColumnName`, t.columnName)
        formData.append(`Translate[${index}].TranslateText`, t.translateText)
      })
    } else {
      // Send default translation using the question text for all 3 languages
      formData.append('Translate[0].LanguageId', '0') // uz
      formData.append('Translate[0].ColumnName', 'QuestionText')
      formData.append('Translate[0].TranslateText', data.questionText)
      formData.append('Translate[1].LanguageId', '1') // rus
      formData.append('Translate[1].ColumnName', 'QuestionText')
      formData.append('Translate[1].TranslateText', data.questionText)
      formData.append('Translate[2].LanguageId', '2') // eng
      formData.append('Translate[2].ColumnName', 'QuestionText')
      formData.append('Translate[2].TranslateText', data.questionText)
    }

    // Add answers
    data.answers.forEach((answer, index) => {
      formData.append(`Answers[${index}].Text`, answer.text)
      formData.append(`Answers[${index}].IsCorrect`, answer.isCorrect.toString())

      // Add answer translations - always required by backend
      if (answer.translate && answer.translate.length > 0) {
        answer.translate.forEach((t, tIndex) => {
          formData.append(
            `Answers[${index}].Translate[${tIndex}].LanguageId`,
            t.languageId.toString()
          )
          formData.append(`Answers[${index}].Translate[${tIndex}].ColumnName`, t.columnName)
          formData.append(`Answers[${index}].Translate[${tIndex}].TranslateText`, t.translateText)
        })
      } else {
        // Send default translation using the answer text for all 3 languages
        formData.append(`Answers[${index}].Translate[0].LanguageId`, '0') // uz
        formData.append(`Answers[${index}].Translate[0].ColumnName`, 'Text')
        formData.append(`Answers[${index}].Translate[0].TranslateText`, answer.text)
        formData.append(`Answers[${index}].Translate[1].LanguageId`, '1') // rus
        formData.append(`Answers[${index}].Translate[1].ColumnName`, 'Text')
        formData.append(`Answers[${index}].Translate[1].TranslateText`, answer.text)
        formData.append(`Answers[${index}].Translate[2].LanguageId`, '2') // eng
        formData.append(`Answers[${index}].Translate[2].ColumnName`, 'Text')
        formData.append(`Answers[${index}].Translate[2].TranslateText`, answer.text)
      }
    })

    // Remove default Content-Type header so axios can set multipart/form-data with boundary
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
  update: async (id: number, data: UpdateQuestionData): Promise<ApiResponse<{ id: number }>> => {
    const formData = new FormData()

    // Convert QuestionLevel enum string to number for backend
    const levelMap: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 }
    const levelValue = typeof data.level === 'string' ? (levelMap[data.level] ?? 0) : data.level

    formData.append('QuestionText', data.questionText)
    formData.append('Level', levelValue.toString())

    // Add answers
    data.answers.forEach((answer, index) => {
      formData.append(`Answers[${index}].Id`, (answer.id || 0).toString())
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
  delete: async (id: number): Promise<ApiResponse<string>> => {
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
    // Otherwise, use backend download endpoint
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001'
    return `${baseUrl}/api/QuestionAnswer/download?objectName=${encodeURIComponent(image)}`
  },
}

export { handleApiError }
