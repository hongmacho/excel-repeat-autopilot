'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import Link from 'next/link'

export default function RecipesPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            레시피 관리
          </h1>
          <Link href="/recipes/new">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
              새 레시피 만들기
            </button>
          </Link>
        </div>

        {/* Empty State */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            📋 아직 만든 레시피가 없습니다
          </p>
          <Link href="/recipes/new">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
              새로운 레시피 만들기
            </button>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}
