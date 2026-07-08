'use client'

import Link from 'next/link'
import { AppLayout } from '@/components/layout/AppLayout'

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Excel 작업을 자동화하세요
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            매달 반복되는 엑셀 작업을 드래그앤드롭으로 정의하고 버튼 하나로 실행하세요.
            비기술자도 쉽게 사용할 수 있습니다.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/recipes/new">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                새 레시피 만들기
              </button>
            </Link>
            <Link href="/templates">
              <button className="border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors">
                템플릿 보기
              </button>
            </Link>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              생성된 레시피
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              처리한 데이터
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0행</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              자동화 실행
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0회</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
              절감 시간
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0시간</p>
          </div>
        </section>

        {/* Empty State Message */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            아직 만든 레시피가 없습니다.
          </p>
          <Link href="/recipes/new">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
              첫 번째 레시피 만들기
            </button>
          </Link>
        </section>
      </div>
    </AppLayout>
  )
}
