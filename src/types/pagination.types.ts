export interface PageOption {
  pageNumber: number
  pageSize: number
  search?: string
}

export interface PaginationResult<T> {
  values: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  hasPrevious: boolean
  hasNext: boolean
}
