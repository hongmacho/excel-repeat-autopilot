import { ValidationError } from './errors'

export function validateRecipeName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('레시피명은 필수입니다')
  }
  if (name.length > 50) {
    throw new ValidationError('레시피명은 50자 이내여야 합니다')
  }
}

export function validateInputColumns(columns: string[]): void {
  if (!Array.isArray(columns) || columns.length === 0) {
    throw new ValidationError('최소 1개 이상의 입력 열을 정의해야 합니다')
  }

  const uniqueColumns = new Set(columns)
  if (uniqueColumns.size !== columns.length) {
    throw new ValidationError('중복된 열명이 있습니다')
  }

  columns.forEach((col) => {
    if (!col || col.trim().length === 0) {
      throw new ValidationError('공백 열명은 허용되지 않습니다')
    }
  })
}

export function validateFileSize(sizeBytes: number, maxMB: number = 50): void {
  const maxBytes = maxMB * 1024 * 1024
  if (sizeBytes > maxBytes) {
    throw new ValidationError(`파일 크기는 ${maxMB}MB 이하여야 합니다`)
  }
}

export function validateCsvData(data: unknown[]): void {
  if (!Array.isArray(data)) {
    throw new ValidationError('CSV 파일을 파싱할 수 없습니다')
  }
  if (data.length === 0) {
    throw new ValidationError('파일이 비어있습니다')
  }
}

export function validateColumnExists(
  data: Record<string, unknown>,
  columnName: string
): void {
  if (!(columnName in data)) {
    throw new ValidationError(`필요한 열 '${columnName}'을(를) 찾을 수 없습니다`)
  }
}

export function validateSteps(steps: unknown[]): void {
  if (!Array.isArray(steps)) {
    throw new ValidationError('변환 단계가 유효하지 않습니다')
  }
  if (steps.length === 0) {
    throw new ValidationError('최소 1개 이상의 변환 단계를 정의해야 합니다')
  }
}
