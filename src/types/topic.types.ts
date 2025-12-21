// Topic types based on backend models (using Guid = string)

export interface Topic {
  id: string
  topicName: string
  subjectId: string
  subjectName: string
  questionCount: number
}

export interface SubjectTopicsResponse {
  subjectId: string
  subjectName: string
  topics: Topic[]
}

export interface TopicPageParams {
  subjectId?: string
  pageNumber: number
  pageSize: number
  search?: string
}

export interface CreateTopicData {
  TopicName: string
  SubjectId: string
}

export interface UpdateTopicData {
  TopicName: string
}

export interface CreateTopicResponse {
  id: string
}

export interface UpdateTopicResponse {
  id: string
}

export interface PaginationResult<T> {
  values: T[]
  pageSize: number
  pageNumber: number
  totalCount: number
}
