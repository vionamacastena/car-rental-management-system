export interface PaginatedMeta {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
}

export interface PaginatedLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  links: PaginatedLinks
  meta: PaginatedMeta
}

export interface SingleResponse<T> {
  data: T
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
