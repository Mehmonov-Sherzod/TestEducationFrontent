import api from './axios.config'

interface ApiResponse<T> {
  Succeeded: boolean
  Result: T
  Errors: string[]
}

export interface SharedSource {
  id?: string
  description: string
  image: string
  price: number
  path?: string
  subjectId?: string
  subjectName?: string
}

export interface UserSharedSource {
  description?: string
  Description?: string
  path?: string
  Path?: string
  userId?: string
  UserId?: string
}

export interface CreateSharedSourceData {
  description: string
  price: number
  file: File
  subjectId: string
}

export interface CreateSharedSourceResponse {
  id: string
}

export interface PageOption {
  PageNumber: number
  PageSize: number
  Search?: string
  SubjectId?: string
}

export interface PaginationResult<T> {
  Values: T[]
  PageNumber: number
  PageSize: number
  TotalCount: number
  HasPrevious: boolean
  HasNext: boolean
}

export const libraryService = {
  /**
   * Create a new shared source (book/resource)
   * POST /api/SharedSource/create-source
   */
  create: async (data: CreateSharedSourceData): Promise<ApiResponse<CreateSharedSourceResponse>> => {
    const formData = new FormData()
    formData.append('Description', data.description)
    formData.append('Price', data.price.toString())
    formData.append('File', data.file)
    formData.append('SubjectId', data.subjectId.toString())

    return api.post('/api/SharedSource/create-source', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * Get all shared sources
   * GET /api/SharedSource/get-all
   */
  getAll: async (): Promise<ApiResponse<SharedSource[]>> => {
    return api.get('/api/SharedSource/get-all')
  },

  /**
   * Get paginated shared sources
   * POST /api/SharedSource?SubjectId={subjectId}
   */
  getPaged: async (pageOption: PageOption): Promise<ApiResponse<PaginationResult<SharedSource>>> => {
    const { SubjectId, ...body } = pageOption
    const url = SubjectId ? `/api/SharedSource?SubjectId=${SubjectId}` : '/api/SharedSource'
    return api.post(url, body)
  },

  /**
   * Get shared sources by subject
   * GET /api/SharedSource/by-subject/{subjectId}
   */
  getBySubject: async (subjectId: string): Promise<ApiResponse<SharedSource[]>> => {
    return api.get(`/api/SharedSource/by-subject/${subjectId}`)
  },

  /**
   * Delete a shared source
   * DELETE /api/SharedSource/{id}
   */
  delete: async (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/api/SharedSource/${id}`)
  },

  /**
   * Get my purchased books
   * GET /api/UserSharedSources (GetMyBook API)
   */
  getMyBooks: async (): Promise<ApiResponse<UserSharedSource[]>> => {
    return api.get('/api/UserSharedSources')
  },

  /**
   * Buy a book
   * POST /api/BoughtSource?SheredSourceId={sharedSourceId}
   */
  buyBook: async (sharedSourceId: string): Promise<ApiResponse<string>> => {
    return api.post(`/api/BoughtSource?SheredSourceId=${sharedSourceId}`)
  },
}
