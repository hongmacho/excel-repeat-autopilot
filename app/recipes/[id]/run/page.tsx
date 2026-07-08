'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Papa from 'papaparse'
import type { Recipe, Step } from '@/lib/db/schema'
import Link from 'next/link'
import { Download } from 'lucide-react'

export default function RecipeRunPage() {
  const params = useParams()
  const recipeId = params.id as string

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [result, setResult] = useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/api/recipes/${recipeId}`)
        const data = await res.json()
        if (data.success) {
          setRecipe(data.data)
        } else {
          setError('레시피를 찾을 수 없습니다')
        }
      } catch (err) {
        setError('레시피 로드에 실패했습니다')
        console.error(err)
      }
    }
    fetchRecipe()
  }, [recipeId])

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('csv')) {
      setError('CSV 파일만 지원합니다')
      return
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('파일 크기가 50MB를 초과합니다')
      return
    }

    setFile(selectedFile)
    setError('')
    parseCSV(selectedFile)
  }

  const parseCSV = (csvFile: File) => {
    setLoading(true)
    setProgress(0)

    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        if (results.data && Array.isArray(results.data)) {
          const filteredData = (results.data as Record<string, unknown>[]).filter(
            (row) => Object.keys(row).some((key) => row[key] !== '')
          )
          setData(filteredData)
          setError('')
          setProgress(100)
        }
        setLoading(false)
      },
      error: (error) => {
        setError(`파일 파싱 오류: ${error.message}`)
        setLoading(false)
      },
    })
  }

  const handleTransform = async () => {
    if (!data.length || !recipe) return

    try {
      setLoading(true)
      setError('')
      setProgress(0)

      const steps = JSON.parse(recipe.steps as string) as Step[]
      const expectedColumns = JSON.parse(recipe.inputColumns as string) as string[]

      // Validate columns
      const firstRow = data[0]
      const actualColumns = Object.keys(firstRow)

      for (const col of expectedColumns) {
        if (!actualColumns.includes(col)) {
          throw new Error(`필요한 열을 찾을 수 없습니다: "${col}"`)
        }
      }

      // Apply steps
      let transformed = [...data]
      for (let i = 0; i < steps.length; i++) {
        transformed = applyStep(transformed, steps[i])
        setProgress(Math.floor(((i + 1) / steps.length) * 100))
      }

      // Record execution
      await fetch(`/api/recipes/${recipeId}/execution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file?.name || 'unknown',
          inputRowCount: data.length,
          outputRowCount: transformed.length,
          status: 'success',
        }),
      }).catch(() => {
        // Ignore execution logging errors
      })

      setResult(transformed)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : '변환 중 오류 발생')
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    if (!result) return

    const headers = result.length > 0 ? Object.keys(result[0]) : []
    const csvContent = [headers.map((h) => `"${h}"`).join(',')]

    for (const row of result) {
      const values = headers.map((h) => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val)
        return `"${str.replace(/"/g, '""')}"`
      })
      csvContent.push(values.join(','))
    }

    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${recipe?.name || 'result'}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!recipe) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">레시피를 로드 중...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            레시피 실행
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{recipe.name}</p>
          {recipe.description && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{recipe.description}</p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
            ❌ {error}
          </div>
        )}

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">1. CSV 파일 업로드</h2>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              if (e.dataTransfer.files[0]) {
                handleFileSelect(e.dataTransfer.files[0])
              }
            }}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
              id="csv-input"
            />
            <label htmlFor="csv-input" className="block">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                📁 파일을 여기에 드래그하거나 클릭하여 선택
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                CSV 파일만 지원합니다 (최대 50MB)
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ✓ 파일: <span className="font-semibold">{file.name}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.length}행이 로드되었습니다
              </p>
            </div>
          )}

          {data.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                데이터 미리보기
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      {Object.keys(data[0]).map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-semibold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-300 dark:border-gray-700">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-3 py-2 text-xs">
                            {String(val || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length > 5 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  ... 외 {data.length - 5}행
                </p>
              )}
            </div>
          )}
        </div>

        {/* Transform */}
        {data.length > 0 && !result && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">2. 변환 실행</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {JSON.parse(recipe.steps as string).length}개의 변환 단계가 적용됩니다.
            </p>
            <button
              onClick={handleTransform}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg"
            >
              {loading ? `변환 중... ${progress}%` : '변환 시작'}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                3. 결과 ({result.length}행)
              </h2>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
              >
                <Download className="h-4 w-4" />
                CSV 다운로드
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    {result.length > 0 &&
                      Object.keys(result[0]).map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-semibold">
                          {col}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {result.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-300 dark:border-gray-700">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-3 py-2 text-xs">
                          {String(val || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.length > 10 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                ... 외 {result.length - 10}행
              </p>
            )}

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => {
                  setResult(null)
                  setData([])
                  setFile(null)
                }}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold py-2 px-4 rounded-lg"
              >
                다시 처리
              </button>
              <Link href="/recipes" className="flex-1">
                <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold py-2 px-4 rounded-lg">
                  돌아가기
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function applyStep(data: Record<string, unknown>[], step: Step): Record<string, unknown>[] {
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

    case 'sort': {
      const { column, order } = config
      if (!column) return data

      return [...data].sort((a, b) => {
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
      const { column, function: func } = config
      if (!column) return data

      const values = data.map((r) => Number(r[column as string]) || 0)
      let aggregated: number

      switch (func) {
        case 'sum':
          aggregated = values.reduce((a, b) => a + b, 0)
          break
        case 'avg':
          aggregated = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
          break
        case 'count':
          aggregated = data.length
          break
        default:
          aggregated = data.length
      }

      return [{ [column as string]: aggregated, result: aggregated }]
    }

    case 'copy': {
      const { from, to } = config
      if (!from || !to) return data

      return data.map((row) => ({
        ...row,
        [to as string]: row[from as string],
      }))
    }

    case 'calculate': {
      const { resultColumn, function: func } = config
      if (!resultColumn) return data

      return data.map((row) => {
        const value = Number(row[resultColumn as string]) || 0
        return { ...row, [`calculated_${resultColumn}`]: value }
      })
    }

    default:
      return data
  }
}
