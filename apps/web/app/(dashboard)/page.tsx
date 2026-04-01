import Link from 'next/link'

const MODULES = [
  { href: '/sourcing', label: 'M1 소싱', desc: 'AliExpress 상품 수집', color: '#FFB3C1' },
  { href: '#', label: 'M2 가공', desc: 'LLM 번역 · 이미지 처리', color: '#e2e8f0' },
  { href: '#', label: 'M3 마켓', desc: '스마트스토어 · 쿠팡 · 11번가', color: '#e2e8f0' },
  { href: '#', label: 'M4 검수', desc: '바코드 스캔 · QC 체크리스트', color: '#e2e8f0' },
  { href: '#', label: 'M5 통계', desc: '판매 집계 · 환율 이력', color: '#e2e8f0' },
]

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#4A4E69' }}>DearStore</h1>
          <p className="mt-1 text-gray-400 text-sm">구매대행 올인원 허브</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {MODULES.map(m => (
            <Link
              key={m.href}
              href={m.href}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
              style={m.color !== '#e2e8f0' ? { borderColor: m.color } : {}}
            >
              <div
                className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
                style={{ backgroundColor: m.color, color: m.color === '#e2e8f0' ? '#9ca3af' : '#4A4E69' }}
              >
                {m.label}
              </div>
              <p className="text-sm text-gray-600">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
