// Backend API response wrapper
// Backend uses PascalCase for property names
export interface ApiResponse<T> {
  Succeeded: boolean
  Result: T
  Errors: string[]
}

// Generic error response
export interface ApiError {
  message: string
  statusCode: number
}
