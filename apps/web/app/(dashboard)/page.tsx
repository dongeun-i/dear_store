'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/templates/AppLayout'
import KpiCard from '@/components/atoms/KpiCard'
import Icon from '@/components/atoms/Icon'
import RecentJobs from '@/components/organisms/RecentJobs'
import Spinner from '@/components/atoms/Spinner'

type Stats = {
  products: { total: number; raw: number; edited: number; uploaded: number }
  jobs: { todayDone: number; todayFailed: number; active: number }
  recentJobs: Array<{
    id: string
    url: string
    status: 'pending' | 'running' | 'done' | 'failed'
    error: string | null
    createdAt: string
  }>
}

const MODULES = [
  { href: '/sourcing',  icon: 'language',      label: '제품 소싱',  desc: 'AliExpress 수집',         active: true },
  { href: '#',          icon: 'auto_fix_high',  label: 'AI 가공',    desc: 'LLM 번역 · 이미지',       active: false },
  { href: '#',          icon: 'storefront',     label: '마켓 연동',  desc: '스마트스토어 · 쿠팡',     active: false },
  { href: '#',          icon: 'shopping_cart',  label: '주문 관리',  desc: '통합 주문 조회',           active: false },
  { href: '#',          icon: 'checklist',      label: 'QA 검수',    desc: '바코드 · 체크리스트',     active: false },
  { href: '#',          icon: 'bar_chart',      label: '통계',       desc: '매출 · 수익 분석',        active: false },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const json = await res.json()
      setStats(prev => {
        const next = json.data
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 10000)
    return () => clearInterval(id)
  }, [fetchStats])

  return (
    <AppLayout
      header={
        <h2 className="text-sm font-semibold text-gray-900">대시보드</h2>
      }
    >
      <div className="space-y-6">

        {/* KPI 카드 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* 메인 KPI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <KpiCard
                icon="inventory_2"
                label="전체 상품"
                value={stats?.products.total ?? 0}
                sub="수집된 전체 상품"
                accent
                href="/products"
              />
              <KpiCard
                icon="today"
                label="오늘 수집"
                value={stats?.jobs.todayDone ?? 0}
                sub="완료된 수집 건수"
                href="/sourcing"
              />
              <KpiCard
                icon="sync"
                label="수집 중"
                value={stats?.jobs.active ?? 0}
                sub="진행 중인 잡"
                href="/sourcing"
              />
              <KpiCard
                icon="error_outline"
                label="오늘 실패"
                value={stats?.jobs.todayFailed ?? 0}
                sub="실패한 수집 건수"
                href="/sourcing"
              />
            </div>

            {/* 상품 상태 + 최근 활동 */}
            <div className="grid grid-cols-3 gap-3">
              {/* 상품 상태 */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <p className="text-xs font-semibold text-gray-600 mb-4">상품 현황</p>
                <div className="space-y-3">
                  {[
                    { label: 'RAW (미편집)',  value: stats?.products.raw ?? 0,      color: 'bg-gray-200',   href: '/products?status=raw' },
                    { label: '편집됨',         value: stats?.products.edited ?? 0,   color: 'bg-[#b7eaff]',  href: '/products?status=edited' },
                    { label: '마켓 등록됨',    value: stats?.products.uploaded ?? 0, color: 'bg-[#ffd9e0]',  href: '/products?status=uploaded' },
                  ].map(({ label, value, color, href }) => {
                    const total = stats?.products.total ?? 0
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0
                    return (
                      <Link key={label} href={href} className="block group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 group-hover:text-gray-800 transition-colors">{label}</span>
                          <span className="text-xs font-semibold text-gray-700">{value.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <Link
                  href="/sourcing"
                  className="mt-5 flex items-center gap-1 text-xs font-medium text-[#b90a5a] hover:underline"
                >
                  소싱 페이지로
                  <Icon name="arrow_forward" size="sm" />
                </Link>
              </div>

              {/* 최근 수집 활동 */}
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-600">최근 수집 활동</p>
                  <Link href="/sourcing" className="text-xs text-gray-400 hover:text-gray-600">
                    전체 보기
                  </Link>
                </div>
                <RecentJobs jobs={stats?.recentJobs ?? []} />
              </div>
            </div>

            {/* 모듈 바로가기 */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-3">메뉴</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {MODULES.map(m => (
                  <Link
                    key={m.label}
                    href={m.href}
                    className={`group bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center transition-all duration-150 ${
                      m.active
                        ? 'hover:border-gray-200 hover:shadow-sm cursor-pointer'
                        : 'opacity-40 pointer-events-none cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      <Icon name={m.icon} size="md" className={m.active ? 'text-[#b90a5a]' : 'text-gray-300'} />
                    </div>
                    <p className="text-xs font-medium text-gray-700 truncate">{m.label}</p>
                    {!m.active && (
                      <p className="text-[10px] text-gray-300 mt-0.5">준비 중</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </AppLayout>
  )
}
