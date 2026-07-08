import type { Step } from '@/lib/db/schema'

export interface RecipeFormData {
  name: string
  description?: string
  tags: string[]
  inputColumns: string[]
  steps: Step[]
}

export interface ExecutionResult {
  success: boolean
  data?: Record<string, unknown>[]
  error?: string
  rowsProcessed?: number
  duration?: number
}

export interface FileUploadResult {
  data: Record<string, unknown>[]
  fileName: string
  encoding?: string
  rowCount: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type SortOrder = 'asc' | 'desc'
export type RecipeSortBy = 'name' | 'createdAt' | 'lastRunAt' | 'runCount'
