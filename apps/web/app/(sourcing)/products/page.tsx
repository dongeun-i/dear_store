'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppLayout from '@/components/templates/AppLayout'
import StatusChip from '@/components/atoms/StatusChip'
import Icon from '@/components/atoms/Icon'
import Spinner from '@/components/atoms/Spinner'

type ProductStatus = 'raw' | 'edited' | 'uploaded'

type Product = {
  id: string
  aliProductId: string
  titleOriginal: string
  titleKo: string | null
  originalPrice: string | null
  salePrice: string | null
  currency: string
  images: string[]
  stock: number
  orders: string
  ratings: { average: string; total_count: number } | null
  storeInfo: { name: string } | null
  status: ProductStatus
  createdAt: string
}

type DeleteState = { id: string; step: 'confirm' | 'deleting' } | null

const STATUS_TABS: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all',      label: '전체' },
  { value: 'raw',      label: 'RAW' },
  { value: 'edited',   label: '편집됨' },
  { value: 'uploaded', label: '마켓 등록' },
]

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const initialTab = (searchParams.get('status') as ProductStatus | null) ?? 'all'
  const [tab, setTab] = useState<ProductStatus | 'all'>(initialTab)
  const [search, setSearch] = useState('')
  const [deleteState, setDeleteState] = useState<DeleteState>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=200')
      const json = await res.json()
      setProducts(json.data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setDeleteState({ id, step: 'deleting' })
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) setProducts(prev => prev.filter(p => p.id !== id))
    } finally {
      setDeleteState(null)
    }
  }

  const filtered = products.filter(p => {
    const matchTab = tab === 'all' || p.status === tab
    const q = search.toLowerCase()
    const matchSearch = !q
      || p.titleOriginal.toLowerCase().includes(q)
      || (p.titleKo ?? '').toLowerCase().includes(q)
      || p.aliProductId.includes(q)
    return matchTab && matchSearch
  })

  return (
    <AppLayout
      header={
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900">상품 관리</h2>
          {!loading && (
            <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
              {products.length}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-4">

        {/* 필터 바 */}
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-0.5">
            {STATUS_TABS.map(t => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === t.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-sm">
            <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="상품명, 알리 ID 검색..."
              className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
            />
          </div>

          <span className="text-xs text-gray-400 ml-auto">{filtered.length}개</span>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Spinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Icon name="inventory_2" size="lg" className="text-gray-200" />
              <p className="text-sm text-gray-400">상품이 없습니다</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-10">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">상품</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-28">원가</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">판매수</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">평점</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-20">재고</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">상태</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 w-24">수집일</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product, idx) => (
                  <tr
                    key={product.id}
                    onClick={() => router.push(`/sourcing/${product.id}`)}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-4 py-3 text-xs text-gray-300 tabular-nums">{idx + 1}</td>

                    {/* 상품 — 이미지 + 제목 클릭 가능 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="image" size="sm" className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 group-hover:text-gray-900">
                            {product.titleKo ?? product.titleOriginal}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">#{product.aliProductId}</p>
                        </div>
                      </div>
                    </td>

                    {/* 원가 */}
                    <td className="px-4 py-3">
                      {product.originalPrice ? (
                        <div>
                          <span className="text-xs font-semibold text-gray-900">
                            {Number(product.originalPrice).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400 ml-1">{product.currency}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>

                    {/* 판매수 */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{product.orders ?? '-'}</span>
                    </td>

                    {/* 평점 */}
                    <td className="px-4 py-3">
                      {product.ratings ? (
                        <div className="flex items-center gap-1">
                          <Icon name="star" size="sm" className="text-amber-400" filled />
                          <span className="text-xs text-gray-700">{product.ratings.average}</span>
                          <span className="text-[10px] text-gray-400">({product.ratings.total_count})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>

                    {/* 재고 */}
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${
                        (product.stock ?? 0) > 100 ? 'text-gray-700' :
                        (product.stock ?? 0) > 0 ? 'text-amber-600' : 'text-gray-300'
                      }`}>
                        {product.stock?.toLocaleString() ?? '-'}
                      </span>
                    </td>

                    {/* 상태 */}
                    <td className="px-4 py-3">
                      <StatusChip status={product.status} />
                    </td>

                    {/* 수집일 */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">
                        {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </td>

                    {/* 삭제 */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {deleteState?.id === product.id ? (
                          deleteState.step === 'confirm' ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={e => handleDelete(e, product.id)}
                                className="text-[10px] font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-md"
                              >
                                삭제
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setDeleteState(null) }}
                                className="text-[10px] text-gray-400 hover:text-gray-600 px-1"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <Spinner size="sm" />
                          )
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteState({ id: product.id, step: 'confirm' }) }}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded"
                          >
                            <Icon name="delete" size="sm" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
