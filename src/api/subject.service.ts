import api from './axios.config'
import { ApiResponse } from '@appTypes/api.types'
import { Subject, CreateSubjectData, UpdateSubjectData, SubjectResponse } from '@appTypes/subject.types'
import { PageOption, PaginationResult } from '@appTypes/pagination.types'

export const subjectService = {
  /**
   * Get all subjects (without pagination)
   * GET /api/Subject/get-all
   */
  getAll: async (lang: string = 'uz'): Promise<ApiResponse<SubjectResponse[]>> => {
    return api.get('/api/Subject/get-all', { headers: { lang } })
  },

  /**
   * Get subject by ID
   * GET /api/Subject/{id}
   */
  getById: async (id: number, lang: string = 'eng'): Promise<ApiResponse<SubjectResponse>> => {
    return api.get(`/api/Subject/${id}`, { headers: { lang } })
  },

  /**
   * Get paginated subjects
   * POST /api/Subject/get-all-page
   */
  getPaginated: async (pageOption: PageOption, lang: string = 'eng'): Promise<ApiResponse<PaginationResult<Subject>>> => {
    return api.post('/api/Subject/get-all-page', pageOption, { headers: { lang } })
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
