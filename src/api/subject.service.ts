import api from './axios.config'
import { ApiResponse } from '@appTypes/api.types'
import { Subject, CreateSubjectData, UpdateSubjectData, SubjectResponse } from '@appTypes/subject.types'
import { PageOption, PaginationResult } from '@appTypes/pagination.types'

export const subjectService = {
  /**
   * Get all subjects (fetches all with large page size)
   * POST /api/Subject/get-all-page
   */
  getAll: async (): Promise<ApiResponse<SubjectResponse[]>> => {
    const response: any = await api.post('/api/Subject/get-all-page', {
      PageNumber: 1,
      PageSize: 1000,
      Search: '',
    })
    // Transform paginated response to array
    if (response.Succeeded && response.Result?.Values) {
      return {
        Succeeded: response.Succeeded,
        Result: response.Result.Values,
        Errors: response.Errors || [],
      }
    }
    return {
      Succeeded: response.Succeeded || false,
      Result: [],
      Errors: response.Errors || [],
    }
  },

  /**
   * Get subject by ID
   * GET /api/Subject/{id}
   */
  getById: async (id: number): Promise<ApiResponse<SubjectResponse>> => {
    return api.get(`/api/Subject/${id}`)
  },

  /**
   * Get paginated subjects
   * POST /api/Subject/get-all-page
   */
  getPaginated: async (pageOption: PageOption): Promise<ApiResponse<PaginationResult<Subject>>> => {
    return api.post('/api/Subject/get-all-page', pageOption)
  },

  /**
   * Create subject
   * POST /api/Subject
   */
  create: async (data: CreateSubjectData): Promise<ApiResponse<{ id: number }>> => {
    return api.post('/api/Subject', data)
  },

  /**
   * Update subject
   * PUT /api/Subject/{id}
   */
  update: async (id: number, data: UpdateSubjectData): Promise<ApiResponse<{ id: number }>> => {
    return api.put(`/api/Subject/${id}`, data)
  },

  /**
   * Delete subject
   * DELETE /api/Subject/{id}
   */
  delete: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete(`/api/Subject/${id}`)
  },
}
