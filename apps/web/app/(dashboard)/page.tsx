import AppLayout from '@/components/templates/AppLayout'
import Icon from '@/components/atoms/Icon'
import Link from 'next/link'

const MODULES = [
  {
    href: '/sourcing',
    icon: 'language',
    label: '제품 소싱',
    desc: 'AliExpress 상품 자동 수집',
    active: true,
  },
  {
    href: '#',
    icon: 'auto_fix_high',
    label: 'AI 가공',
    desc: 'LLM 번역 · 이미지 처리',
    active: false,
  },
  {
    href: '#',
    icon: 'storefront',
    label: '마켓 연동',
    desc: '스마트스토어 · 쿠팡 · 11번가',
    active: false,
  },
  {
    href: '#',
    icon: 'shopping_cart',
    label: '주문 관리',
    desc: '통합 주문 조회 · 처리',
    active: false,
  },
  {
    href: '#',
    icon: 'checklist',
    label: 'QA 검수',
    desc: '바코드 스캔 · 체크리스트',
    active: false,
  },
  {
    href: '#',
    icon: 'bar_chart',
    label: '통계',
    desc: '매출 · 수익 · 환율 손익',
    active: false,
  },
]

export default function DashboardPage() {
  return (
    <AppLayout
      header={
        <div>
          <h2 className="text-sm font-bold text-[#1d1b1d]">대시보드</h2>
          <p className="text-[11px] text-[#594046]/60">구매대행 올인원 허브</p>
        </div>
      }
    >
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">대시보드</h1>
        <p className="text-gray-400 mt-1 text-sm">소싱부터 판매까지, 모든 흐름을 한 곳에서</p>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MODULES.map(m => (
          <Link
            key={m.label}
            href={m.href}
            className={`group relative bg-white rounded-xl p-5 border border-gray-100 transition-all duration-200 ${
              m.active
                ? 'hover:border-gray-200 hover:shadow-sm cursor-pointer'
                : 'opacity-40 cursor-not-allowed pointer-events-none'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                m.active ? 'bg-gray-50' : 'bg-gray-50'
              }`}>
                <Icon name={m.icon} size="md" className={m.active ? 'text-[#b90a5a]' : 'text-gray-300'} />
              </div>
              {m.active ? (
                <span className="w-2 h-2 rounded-full bg-[#b90a5a] mt-1" />
              ) : (
                <span className="text-[10px] text-gray-300 font-medium">준비 중</span>
              )}
            </div>
            <p className={`text-sm font-semibold mb-0.5 ${m.active ? 'text-gray-900' : 'text-gray-400'}`}>
              {m.label}
            </p>
            <p className="text-xs text-gray-400">{m.desc}</p>
          </Link>
        ))}
      </div>
    </AppLayout>
  )
}
