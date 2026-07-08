'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { Recipe } from '@/lib/db/schema'
import { formatDate } from '@/lib/utils/formatters'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true)
      try {
        const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''
        const res = await fetch(`/api/recipes${query}`)
        const data = await res.json()
        if (data.success) {
          setRecipes(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchRecipes, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 레시피를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setRecipes(recipes.filter((r) => r.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error)
    }
  }

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

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="레시피명 또는 설명으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">로드 중...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              📋 {searchQuery ? '검색 결과가 없습니다' : '아직 만든 레시피가 없습니다'}
            </p>
            <Link href="/recipes/new">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
                새로운 레시피 만들기
              </button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    레시피명
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    설명
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    생성일
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    실행
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {recipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                      {recipe.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm truncate">
                      {recipe.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {formatDate(recipe.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {recipe.runCount}회
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/recipes/${recipe.id}/run`}>
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold text-sm">
                            실행
                          </button>
                        </Link>
                        <Link href={`/recipes/${recipe.id}/edit`}>
                          <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 font-semibold text-sm">
                            수정
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(recipe.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 font-semibold text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
