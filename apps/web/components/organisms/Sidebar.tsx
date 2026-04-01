'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/components/atoms/Icon'

const NAV_ITEMS = [
  { href: '/',          icon: 'dashboard',      label: '대시보드' },
  { href: '/sourcing',  icon: 'language',        label: '제품 소싱' },
  { href: '/products',  icon: 'inventory_2',     label: '상품 관리' },
  { href: '/orders',    icon: 'shopping_cart',   label: '주문 관리' },
  { href: '/qc',        icon: 'checklist',       label: 'QA 관리' },
  { href: '/analytics', icon: 'bar_chart',       label: '통계' },
]

const BOTTOM_ITEMS = [
  { href: '/settings',  icon: 'settings',        label: '설정' },
]

export default function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside className="h-screen w-56 fixed left-0 top-0 bg-gray-900 flex flex-col py-5 z-50">
      {/* Brand */}
      <div className="px-5 mb-8">
        <h1 className="text-base font-bold text-white tracking-tight">DearStore</h1>
        <p className="text-[10px] text-gray-400 mt-0.5">구매대행 올인원 허브</p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                active
                  ? 'bg-gray-800 text-white font-medium'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 font-normal'
              }`}
            >
              <Icon
                name={item.icon}
                size="sm"
                filled={active}
                className={active ? 'text-[#ff4d8d]' : 'text-gray-500'}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 border-t border-gray-800 pt-3 mt-3 flex flex-col gap-0.5">
        {BOTTOM_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                active
                  ? 'bg-gray-800 text-white font-medium'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 font-normal'
              }`}
            >
              <Icon name={item.icon} size="sm" className={active ? 'text-[#ff4d8d]' : 'text-gray-500'} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
