import type { Step } from '@/lib/db/schema'
import { FileProcessingError } from '@/lib/utils/errors'

export class ParsingService {
  /**
   * Parse CSV data and apply transformation steps
   */
  static applySteps(data: Record<string, unknown>[], steps: Step[]): Record<string, unknown>[] {
    let result = [...data]

    for (const step of steps) {
      try {
        result = this.executeStep(result, step)
      } catch (error) {
        throw new FileProcessingError(
          `단계 실행 중 오류: ${step.type} - ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        )
      }
    }

    return result
  }

  private static executeStep(data: Record<string, unknown>[], step: Step): Record<string, unknown>[] {
    const config = step.config

    switch (step.type) {
      case 'filter': {
        const { column, operator, value } = config
        if (!column || !value) return data

        return data.filter((row) => {
          const rowValue = String(row[column as string] || '')
          const compareValue = String(value)

          switch (operator) {
            case '=':
              return rowValue === compareValue
            case '!=':
              return rowValue !== compareValue
            case '>':
              return Number(rowValue) > Number(compareValue)
            case '<':
              return Number(rowValue) < Number(compareValue)
            case 'contains':
              return rowValue.includes(compareValue)
            default:
              return true
          }
        })
      }

      case 'select': {
        const { columns } = config
        if (!Array.isArray(columns) || columns.length === 0) return data

        return data.map((row) => {
          const newRow: Record<string, unknown> = {}
          for (const col of columns) {
            if (col in row) {
              newRow[col as string] = row[col as string]
            }
          }
          return newRow
        })
      }

      case 'copy': {
        const { from, to } = config
        if (!from || !to) return data

        return data.map((row) => ({
          ...row,
          [to as string]: row[from as string],
        }))
      }

      case 'sort': {
        const { column, order } = config
        if (!column) return data

        const sorted = [...data].sort((a, b) => {
          const aVal = a[column as string]
          const bVal = b[column as string]

          if (aVal === undefined) return 1
          if (bVal === undefined) return -1

          const aNum = Number(aVal)
          const bNum = Number(bVal)
          const isNumeric = !isNaN(aNum) && !isNaN(bNum)

          if (isNumeric) {
            return order === 'asc' ? aNum - bNum : bNum - aNum
          }

          const aStr = String(aVal)
          const bStr = String(bVal)
          return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
        })

        return sorted
      }

      case 'dedup': {
        const { column } = config
        if (!column) return data

        const seen = new Set<unknown>()
        return data.filter((row) => {
          const value = row[column as string]
          if (seen.has(value)) return false
          seen.add(value)
          return true
        })
      }

      case 'aggregate': {
        const { column, function: func, groupBy } = config
        if (!column) return data

        const result: Record<string, unknown>[] = []
        const groups = new Map<unknown, Record<string, unknown>[]>()

        data.forEach((row) => {
          const key = groupBy ? row[groupBy as string] : '__all__'
          if (!groups.has(key)) {
            groups.set(key, [])
          }
          groups.get(key)!.push(row)
        })

        groups.forEach((rows, key) => {
          const values = rows.map((r) => Number(r[column as string]) || 0)
          let aggregated: number

          switch (func) {
            case 'sum':
              aggregated = values.reduce((a, b) => a + b, 0)
              break
            case 'avg':
              aggregated = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
              break
            case 'count':
              aggregated = rows.length
              break
            case 'min':
              aggregated = Math.min(...values)
              break
            case 'max':
              aggregated = Math.max(...values)
              break
            default:
              aggregated = rows.length
          }

          const resultRow: Record<string, unknown> = {}
          if (groupBy) {
            resultRow[groupBy as string] = key
          }
          resultRow[`${column}_${func}`] = aggregated
          result.push(resultRow)
        })

        return result
      }

      case 'calculate': {
        const { resultColumn, function: func, range } = config
        if (!resultColumn) return data

        return data.map((row) => {
          let value = 0

          if (range && Array.isArray(range)) {
            const rangeValues = (range as string[]).map((col) => Number(row[col]) || 0)
            switch (func) {
              case 'sum':
                value = rangeValues.reduce((a, b) => a + b, 0)
                break
              case 'avg':
                value = rangeValues.length > 0 ? rangeValues.reduce((a, b) => a + b, 0) / rangeValues.length : 0
                break
              case 'count':
                value = rangeValues.length
                break
            }
          }

          return {
            ...row,
            [resultColumn as string]: value,
          }
        })
      }

      case 'rename': {
        const { from, to } = config
        if (!from || !to) return data

        return data.map((row) => {
          const newRow: Record<string, unknown> = {}
          for (const [key, val] of Object.entries(row)) {
            if (key === from) {
              newRow[to as string] = val
            } else {
              newRow[key] = val
            }
          }
          return newRow
        })
      }

      default:
        return data
    }
  }

  /**
   * Validate CSV data matches expected columns
   */
  static validateColumns(data: Record<string, unknown>[], expectedColumns: string[]): void {
    if (data.length === 0) {
      throw new FileProcessingError('CSV 파일이 비어있습니다')
    }

    const firstRow = data[0]
    const actualColumns = Object.keys(firstRow)

    for (const col of expectedColumns) {
      if (!actualColumns.includes(col)) {
        throw new FileProcessingError(`필요한 열을 찾을 수 없습니다: "${col}"`)
      }
    }
  }

  /**
   * Format data as CSV string
   */
  static formatAsCSV(data: Record<string, unknown>[]): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const csvRows = [headers.map((h) => `"${h}"`).join(',')]

    for (const row of data) {
      const values = headers.map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return `"${str.replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    }

    return csvRows.join('\n')
  }
}

export const parsingService = new ParsingService()
