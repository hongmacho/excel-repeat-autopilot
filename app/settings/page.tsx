'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [encoding, setEncoding] = useState('utf8')
  const [previewRows, setPreviewRows] = useState(10)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    try {
      setExporting(true)
      const res = await fetch('/api/recipes')
      const data = await res.json()

      if (data.success && data.data) {
        const recipes = data.data
        const exportData = JSON.stringify(recipes, null, 2)
        const blob = new Blob([exportData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `recipes_${new Date().toISOString().slice(0, 10)}.json`
        link.click()
        URL.revokeObjectURL(url)
        setMessage('✓ 레시피가 내보내졌습니다')
      }
    } catch (error) {
      setMessage('✗ 내보내기 실패')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    try {
      const content = await file.text()
      const recipes = JSON.parse(content)

      if (!Array.isArray(recipes)) {
        setMessage('✗ 유효한 레시피 파일이 아닙니다')
        return
      }

      let imported = 0
      for (const recipe of recipes) {
        const res = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipe),
        })
        if ((await res.json()).success) {
          imported++
        }
      }

      setMessage(`✓ ${imported}개의 레시피를 임포트했습니다`)
      setTimeout(() => router.refresh(), 2000)
    } catch (error) {
      setMessage('✗ 임포트 실패')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('정말로 모든 데이터를 삭제하시겠습니까? 이는 되돌릴 수 없습니다.')) return

    try {
      const res = await fetch('/api/recipes')
      const data = await res.json()

      if (data.success && data.data) {
        for (const recipe of data.data) {
          await fetch(`/api/recipes/${recipe.id}`, { method: 'DELETE' })
        }
        setMessage('✓ 모든 데이터가 삭제되었습니다')
        setTimeout(() => router.refresh(), 2000)
      }
    } catch (error) {
      setMessage('✗ 삭제 실패')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">설정</h1>

        {message && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg text-blue-700 dark:text-blue-200">
            {message}
          </div>
        )}

        {/* General Settings */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">일반</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                기본 인코딩
              </label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="utf8">UTF-8</option>
                <option value="euckr">EUC-KR</option>
                <option value="cp949">CP949</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                미리보기 행 수
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={previewRows}
                onChange={(e) => setPreviewRows(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">데이터 관리</h2>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full text-left px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
            >
              {exporting ? '내보내는 중...' : '📥 모든 레시피 내보내기'}
            </button>

            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleImport(e.target.files[0])
                  }
                }}
                className="hidden"
              />
              <span className="block w-full text-left px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                📤 레시피 임포트
              </span>
            </label>

            <button
              onClick={handleDeleteAll}
              className="w-full text-left px-4 py-2 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors font-medium text-red-600 dark:text-red-400"
            >
              🗑️ 모든 데이터 삭제 (되돌릴 수 없습니다)
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">정보</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">버전: v1.0.0</p>
          <div className="flex gap-4 text-sm">
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
