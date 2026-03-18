export interface ApiResponse<T> {
  data: T
  meta: PaginationMeta | null
  error: ApiError | null
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  code: string
  message: string
  details?: unknown
  timestamp: string
  path: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}