import api, { handleApiError } from './axios.config'
import {
  SubjectTopicsResponse,
  TopicPageParams,
  CreateTopicData,
  UpdateTopicData,
  CreateTopicResponse,
  UpdateTopicResponse,
  PaginationResult,
} from '@/types/topic.types'

interface ApiResponse<T> {
  Succeeded: boolean
  Result: T
  Errors: string[]
}

export const topicService = {
  /**
   * Get paginated topics grouped by subject
   */
  getPaged: async (
    params: TopicPageParams
  ): Promise<ApiResponse<PaginationResult<SubjectTopicsResponse>>> => {
    const queryParams = new URLSearchParams()

    if (params.subjectId) {
      queryParams.append('SubjectId', params.subjectId)
    }
    queryParams.append('PageNumber', params.pageNumber.toString())
    queryParams.append('PageSize', params.pageSize.toString())
    if (params.search) {
      queryParams.append('Search', params.search)
    }

    return api.get(`/api/topic/paged?${queryParams.toString()}`)
  },

  /**
   * Create a new topic
   */
  create: async (data: CreateTopicData): Promise<ApiResponse<CreateTopicResponse>> => {
    return api.post('/api/topic/create - topic', data)
  },

  /**
   * Update an existing topic
   */
  update: async (
    id: string,
    data: UpdateTopicData
  ): Promise<ApiResponse<UpdateTopicResponse>> => {
    return api.put(`/api/topic/${id}`, data)
  },

  /**
   * Delete a topic
   */
  delete: async (id: string): Promise<ApiResponse<string>> => {
    return api.delete(`/api/topic/${id}`)
  },
}

export { handleApiError }
