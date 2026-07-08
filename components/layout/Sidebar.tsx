'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Zap, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/recipes', label: '레시피 관리', icon: BookOpen },
  { href: '/templates', label: '템플릿 라이브러리', icon: Zap },
  { href: '/dashboard', label: '대시보드', icon: BarChart3 },
  { href: '/settings', label: '설정', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-48 border-r bg-gray-50 dark:bg-gray-950 p-4 space-y-2">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isActive
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
