'use client'

import { AppLayout } from '@/components/layout/AppLayout'

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          설정
        </h1>

        {/* General Settings */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            일반
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                언어
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>한국어</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                시간대
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>Asia/Seoul</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            데이터 관리
          </h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              📥 모든 레시피 내보내기
            </button>
            <button className="w-full text-left px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              📤 레시피 임포트
            </button>
            <button className="w-full text-left px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors text-red-600 dark:text-red-400">
              🗑️ 모든 데이터 삭제 (되돌릴 수 없습니다)
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            정보
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            버전: v0.1.0
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-blue-600 hover:text-blue-700">
              이용약관
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              개인정보
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              피드백
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
