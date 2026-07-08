'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Step } from '@/lib/db/schema'

interface Template {
  name: string
  description: string
  inputColumns: string[]
  steps: Step[]
}

const TEMPLATES: Template[] = [
  {
    name: 'POS 데이터 → 정산 요약',
    description: 'POS에서 받은 매출 데이터를 상품별로 집계하고 합계 계산',
    inputColumns: ['상품명', '수량', '판매가', '시간대'],
    steps: [
      {
        type: 'aggregate',
        config: { column: '판매가', function: 'sum', groupBy: '상품명' },
      } as Step,
      { type: 'sort', config: { column: '판매가', order: 'desc' } } as Step,
    ],
  },
  {
    name: '중복 제거 & 정렬',
    description: '고객 목록에서 중복을 제거하고 이름으로 정렬',
    inputColumns: ['고객명', '이메일', '전화번호'],
    steps: [
      { type: 'dedup', config: { column: '이메일' } } as Step,
      { type: 'sort', config: { column: '고객명', order: 'asc' } } as Step,
    ],
  },
  {
    name: '급여 기본정보 → 급여 계산',
    description: '직원 기본급 정보에서 세금을 제외한 실급여 계산',
    inputColumns: ['사원명', '기본급', '세금율'],
    steps: [
      {
        type: 'calculate',
        config: { resultColumn: '실급여', function: 'sum', range: ['기본급'] },
      } as Step,
    ],
  },
  {
    name: '월별 매출 집계',
    description: '일일 매출 데이터를 월별로 집계하여 추이 분석',
    inputColumns: ['날짜', '매출액', '카테고리'],
    steps: [
      { type: 'aggregate', config: { column: '매출액', function: 'sum' } } as Step,
    ],
  },
  {
    name: '특정 열만 추출',
    description: '필요한 열만 선택하여 불필요한 정보 제거',
    inputColumns: ['주문번호', '고객명', '상품명', '가격', '배송지', '특이사항'],
    steps: [
      {
        type: 'select',
        config: { columns: ['주문번호', '고객명', '상품명', '가격'] },
      } as Step,
    ],
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUseTemplate = async (template: Template) => {
    try {
      setLoading(template.name)

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          tags: JSON.stringify(['템플릿', 'preset']),
          inputColumns: JSON.stringify(template.inputColumns),
          steps: JSON.stringify(template.steps),
        }),
      })

      const data = await res.json()
      if (data.success) {
        router.push(`/recipes/${data.data.id}/run`)
      }
    } catch (error) {
      console.error('Failed to create recipe from template:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            템플릿 라이브러리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            자주 사용되는 작업 템플릿을 선택하여 빠르게 시작하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <div
              key={template.name}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {template.description}
              </p>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">입력 열:</p>
                <div className="flex flex-wrap gap-1">
                  {template.inputColumns.map((col) => (
                    <span
                      key={col}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">변환 단계:</p>
                <ul className="space-y-1">
                  {template.steps.map((step, idx) => (
                    <li key={idx} className="text-gray-600 dark:text-gray-400">
                      {idx + 1}. {getStepLabel(step.type)}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleUseTemplate(template)}
                disabled={loading === template.name}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                {loading === template.name ? '생성 중...' : '이 템플릿 사용'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

function getStepLabel(type: string): string {
  const labels: Record<string, string> = {
    filter: '필터',
    select: '열 선택',
    copy: '열 복사',
    sort: '정렬',
    rename: '열 이름 변경',
    dedup: '중복 제거',
    aggregate: '집계',
    calculate: '계산 열',
  }
  return labels[type] || type
}
