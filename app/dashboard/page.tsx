'use client'

import { AppLayout } from '@/components/layout/AppLayout'
import { useState, useEffect } from 'react'
import type { Recipe, Execution } from '@/lib/db/schema'
import { formatDate, formatNumber } from '@/lib/utils/formatters'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesRes, executionsRes] = await Promise.all([
          fetch('/api/recipes'),
          fetch('/api/executions'),
        ])

        const recipesData = await recipesRes.json()
        const executionsData = await executionsRes.json()

        if (recipesData.success) {
          setRecipes(recipesData.data || [])
        }
        if (executionsData.success) {
          setExecutions(executionsData.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const stats = {
    totalRecipes: recipes.length,
    totalExecutions: executions.filter((e) => e.status === 'success').length,
    totalRowsProcessed: executions.reduce((sum, e) => sum + (e.outputRowCount || 0), 0),
    failedExecutions: executions.filter((e) => e.status === 'failed').length,
    estimatedTimesSaved: Math.floor(
      executions.reduce((sum, e) => sum + (e.outputRowCount || 0), 0) * 0.5 / 60
    ),
  }

  const topRecipes = recipes
    .map((r) => ({ ...r, executions: r.runCount || 0 }))
    .sort((a, b) => (b.executions || 0) - (a.executions || 0))
    .slice(0, 5)

  const chartData = [
    { name: '전체', 실행: stats.totalExecutions, 실패: stats.failedExecutions },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">대시보드</h1>

        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-400">로드 중...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  생성된 레시피
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalRecipes}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  처리한 데이터
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.totalRowsProcessed)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">행</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  자동화 실행
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalExecutions}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">회</p>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  절감 시간
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.estimatedTimesSaved}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">시간</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">실행 현황</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="실행" fill="#3b82f6" />
                  <Bar dataKey="실패" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Recipes */}
            {topRecipes.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                  자주 사용하는 레시피
                </h2>
                <div className="space-y-2">
                  {topRecipes.map((recipe, idx) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {idx + 1}. {recipe.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {recipe.runCount}회
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          마지막: {formatDate(recipe.lastRunAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Executions */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">최근 실행</h2>
              {executions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">실행 기록이 없습니다</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">
                          파일명
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">
                          실행 날짜
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">
                          입력 행
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">
                          출력 행
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-900 dark:text-white">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {executions.slice(0, 10).map((exec) => (
                        <tr
                          key={exec.id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-2 text-gray-900 dark:text-white">
                            {exec.fileName}
                          </td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                            {formatDate(exec.executedAt)}
                          </td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                            {formatNumber(exec.inputRowCount)}
                          </td>
                          <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                            {formatNumber(exec.outputRowCount)}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                exec.status === 'success'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                              }`}
                            >
                              {exec.status === 'success' ? '✓ 성공' : '✗ 실패'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
