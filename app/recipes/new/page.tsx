'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { useState } from 'react'
import Link from 'next/link'
import type { Step } from '@/lib/db/schema'
import { Trash2, Plus } from 'lucide-react'

type StepType = 'filter' | 'select' | 'copy' | 'calculate' | 'sort' | 'rename' | 'dedup' | 'aggregate'

interface StepForm {
  type: StepType
  config: Record<string, unknown>
}

export default function CreateRecipePage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [inputColumns, setInputColumns] = useState<string[]>([''])
  const [steps, setSteps] = useState<Step[]>([])
  const [newStepType, setNewStepType] = useState<StepType>('filter')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const updateInputColumn = (index: number, value: string) => {
    const newColumns = [...inputColumns]
    newColumns[index] = value
    setInputColumns(newColumns)
  }

  const addInputColumn = () => {
    setInputColumns([...inputColumns, ''])
  }

  const removeInputColumn = (index: number) => {
    setInputColumns(inputColumns.filter((_, i) => i !== index))
  }

  const addStep = () => {
    let stepConfig = {}

    switch (newStepType) {
      case 'filter':
        stepConfig = { column: '', operator: '=', value: '' }
        break
      case 'select':
        stepConfig = { columns: [] }
        break
      case 'copy':
        stepConfig = { from: '', to: '' }
        break
      case 'calculate':
        stepConfig = { resultColumn: '', function: 'sum', range: '' }
        break
      case 'sort':
        stepConfig = { column: '', order: 'asc' }
        break
      case 'rename':
        stepConfig = { from: '', to: '' }
        break
      case 'dedup':
        stepConfig = { column: '' }
        break
      case 'aggregate':
        stepConfig = { column: '', function: 'count', groupBy: '' }
        break
    }

    const newStep: Step = {
      type: newStepType,
      config: stepConfig,
    }

    setSteps([...steps, newStep])
  }

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const updateStep = (index: number, config: Record<string, unknown>) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], config }
    setSteps(newSteps)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')

      if (!name.trim()) {
        setError('레시피명은 필수입니다')
        return
      }

      if (inputColumns.filter((c) => c.trim()).length === 0) {
        setError('최소 1개 이상의 입력 열을 정의해야 합니다')
        return
      }

      if (steps.length === 0) {
        setError('최소 1개 이상의 변환 단계를 추가해야 합니다')
        return
      }

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          tags: JSON.stringify(tags),
          inputColumns: JSON.stringify(inputColumns.filter((c) => c.trim())),
          steps: JSON.stringify(steps),
        }),
      })

      const data = await res.json()
      if (data.success) {
        window.location.href = '/recipes'
      } else {
        setError(data.error || '레시피 저장에 실패했습니다')
      }
    } catch (err) {
      setError('오류가 발생했습니다')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            새 레시피 만들기
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Step {step} of 4
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                레시피명 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="레시피명을 입력하세요 (50자 이내)"
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="무엇을 하는 레시피인가요?"
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                태그
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="태그 입력 후 Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <button
                  onClick={addTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Input Columns */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                입력 데이터 열 이름 *
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                이 레시피가 기대하는 CSV의 열 이름을 정의하세요
              </p>
              {inputColumns.map((col, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={col}
                    onChange={(e) => updateInputColumn(idx, e.target.value)}
                    placeholder={`열 ${idx + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {inputColumns.length > 1 && (
                    <button
                      onClick={() => removeInputColumn(idx)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addInputColumn}
                className="mt-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                + 열 추가
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Transformation Steps */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                변환 단계 추가
              </label>
              <div className="flex gap-2 mb-4">
                <select
                  value={newStepType}
                  onChange={(e) => setNewStepType(e.target.value as StepType)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="filter">필터 (조건)</option>
                  <option value="select">열 선택</option>
                  <option value="copy">열 복사/이름변경</option>
                  <option value="sort">정렬</option>
                  <option value="dedup">중복 제거</option>
                  <option value="aggregate">집계</option>
                  <option value="calculate">계산 열 추가</option>
                  <option value="rename">열 이름 변경</option>
                </select>
                <button
                  onClick={addStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  추가
                </button>
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white mb-2">
                        {idx + 1}. {getStepTypeLabel(step.type)}
                      </div>
                      <StepConfigEditor
                        step={step}
                        inputColumns={inputColumns.filter((c) => c.trim())}
                        onUpdate={(config) => updateStep(idx, config)}
                      />
                    </div>
                    <button
                      onClick={() => removeStep(idx)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {steps.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                아직 변환 단계가 없습니다. 위에서 단계를 추가하세요.
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">레시피 요약</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">이름:</span>{' '}
                  {name}
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">설명:</span>{' '}
                  {description || '-'}
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">입력 열:</span>{' '}
                  {inputColumns.filter((c) => c.trim()).join(', ')}
                </p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    변환 단계:
                  </span>{' '}
                  {steps.length}개
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-300">
              ✓ 모든 정보가 준비되었습니다. 저장하면 이 레시피를 사용할 수 있습니다.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4 justify-between">
          <Link href="/recipes">
            <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold">
              취소
            </button>
          </Link>

          <div className="flex gap-4">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold"
              >
                이전
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !name.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function getStepTypeLabel(type: StepType): string {
  const labels: Record<StepType, string> = {
    filter: '필터',
    select: '열 선택',
    copy: '열 복사',
    sort: '정렬',
    rename: '열 이름 변경',
    dedup: '중복 제거',
    aggregate: '집계',
    calculate: '계산 열',
  }
  return labels[type]
}

interface StepConfigEditorProps {
  step: Step
  inputColumns: string[]
  onUpdate: (config: Record<string, unknown>) => void
}

function StepConfigEditor({ step, inputColumns, onUpdate }: StepConfigEditorProps) {
  const config = step.config

  switch (step.type) {
    case 'filter':
      return (
        <div className="flex gap-2">
          <select
            value={(config.column as string) || ''}
            onChange={(e) => onUpdate({ ...config, column: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
          >
            <option value="">열 선택</option>
            {inputColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <select
            value={(config.operator as string) || '='}
            onChange={(e) => onUpdate({ ...config, operator: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
          >
            <option value="=">=</option>
            <option value="!=">!=</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
            <option value="contains">포함</option>
          </select>
          <input
            type="text"
            value={(config.value as string) || ''}
            onChange={(e) => onUpdate({ ...config, value: e.target.value })}
            placeholder="값"
            className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
          />
        </div>
      )

    case 'sort':
      return (
        <div className="flex gap-2">
          <select
            value={(config.column as string) || ''}
            onChange={(e) => onUpdate({ ...config, column: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
          >
            <option value="">열 선택</option>
            {inputColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <select
            value={(config.order as string) || 'asc'}
            onChange={(e) => onUpdate({ ...config, order: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
          >
            <option value="asc">오름차순</option>
            <option value="desc">내림차순</option>
          </select>
        </div>
      )

    case 'select':
      return (
        <div className="flex flex-wrap gap-2">
          {inputColumns.map((col) => (
            <label key={col} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={((config.columns as string[]) || []).includes(col)}
                onChange={(e) => {
                  const selected = (config.columns as string[]) || []
                  if (e.target.checked) {
                    onUpdate({ ...config, columns: [...selected, col] })
                  } else {
                    onUpdate({ ...config, columns: selected.filter((c) => c !== col) })
                  }
                }}
              />
              {col}
            </label>
          ))}
        </div>
      )

    case 'aggregate':
      return (
        <div className="flex gap-2">
          <select
            value={(config.column as string) || ''}
            onChange={(e) => onUpdate({ ...config, column: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
          >
            <option value="">열 선택</option>
            {inputColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <select
            value={(config.function as string) || 'count'}
            onChange={(e) => onUpdate({ ...config, function: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
          >
            <option value="count">개수</option>
            <option value="sum">합계</option>
            <option value="avg">평균</option>
            <option value="min">최소</option>
            <option value="max">최대</option>
          </select>
        </div>
      )

    case 'dedup':
      return (
        <select
          value={(config.column as string) || ''}
          onChange={(e) => onUpdate({ ...config, column: e.target.value })}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
        >
          <option value="">열 선택</option>
          {inputColumns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      )

    case 'calculate':
      return (
        <div className="flex gap-2">
          <input
            type="text"
            value={(config.resultColumn as string) || ''}
            onChange={(e) => onUpdate({ ...config, resultColumn: e.target.value })}
            placeholder="결과 열명"
            className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
          />
          <select
            value={(config.function as string) || 'sum'}
            onChange={(e) => onUpdate({ ...config, function: e.target.value })}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm"
          >
            <option value="sum">합계</option>
            <option value="avg">평균</option>
            <option value="count">개수</option>
          </select>
        </div>
      )

    default:
      return <div className="text-sm text-gray-500">구성 필요</div>
  }
}
