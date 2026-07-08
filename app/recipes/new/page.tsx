'use client'

import { AppLayout } from '@/components/layout/AppLayout'

export default function CreateRecipePage() {
  return (
    <AppLayout>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          새 레시피 만들기
        </h1>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-400">
            레시피 생성 UI는 Sprint 2에서 구현됩니다.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            이 페이지는 Sprint 0의 기본 레이아웃입니다.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
