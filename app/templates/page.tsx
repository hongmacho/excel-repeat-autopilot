'use client'

import { AppLayout } from '@/components/layout/AppLayout'

export default function TemplatesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          템플릿 라이브러리
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          미리 만들어진 템플릿을 사용하여 빠르게 레시피를 생성하세요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'POS 데이터 → 정산 요약',
              description: 'POS에서 받은 매출 데이터를 상품별/시간별로 집계',
            },
            {
              title: '주문 목록 → 배송 라벨',
              description: '주문 CSV를 배송사 형식으로 변환',
            },
            {
              title: '급여 기본정보 → 급여 계산',
              description: '직원 기본정보에서 월급여를 자동 계산',
            },
            {
              title: '재고 현황 → 부족 알림',
              description: '재고 데이터를 분석하여 부족 항목 추출',
            },
            {
              title: '매출 데이터 → 월간 리포트',
              description: '일일 매출 데이터를 월별 리포트로 집계',
            },
          ].map((template) => (
            <div
              key={template.title}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {template.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {template.description}
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                이 템플릿 사용
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
