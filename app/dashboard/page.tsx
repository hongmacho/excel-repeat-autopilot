'use client'

import { AppLayout } from '@/components/layout/AppLayout'

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          대시보드
        </h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '생성된 레시피', value: '0' },
            { label: '처리한 데이터', value: '0행' },
            { label: '자동화 실행', value: '0회' },
            { label: '절감 시간', value: '0시간' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6"
            >
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                {kpi.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            📊 아직 실행 기록이 없습니다.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            레시피를 만들고 실행하면 통계 데이터가 표시됩니다.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
