export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super('NOT_FOUND', message, 404)
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super('DATABASE_ERROR', message, 500)
    this.name = 'DatabaseError'
  }
}

export class FileProcessingError extends AppError {
  constructor(message: string) {
    super('FILE_PROCESSING_ERROR', message, 400)
    this.name = 'FileProcessingError'
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return '예상치 못한 오류가 발생했습니다'
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
