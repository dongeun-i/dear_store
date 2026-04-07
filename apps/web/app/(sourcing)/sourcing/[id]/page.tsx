'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppLayout from '@/components/templates/AppLayout'
import StatusChip from '@/components/atoms/StatusChip'
import Button from '@/components/atoms/Button'
import Icon from '@/components/atoms/Icon'
import Spinner from '@/components/atoms/Spinner'
import InfoRow from '@/components/atoms/InfoRow'

type ProductStatus = 'raw' | 'edited' | 'uploaded'

type Spec = { name: string; value: string }
type Rating = { average: string; total_count: number; five_star: number; four_star: number }
type StoreInfo = { name: string; logo: string; rating: string; rating_count: number; is_top_rated: boolean }

type Product = {
  id: string
  aliProductId: string
  sourceUrl: string | null
  titleOriginal: string
  titleKo: string | null
  originalPrice: string | null
  salePrice: string | null
  currency: string
  images: string[]
  descImages: string[]
  options: Record<string, unknown>[]
  specs: Spec[]
  stock: number
  orders: string
  ratings: Rating | null
  storeInfo: StoreInfo | null
  categoryAli: string | null
  categoryKo: string | null
  status: ProductStatus
  createdAt: string
}

const STATUS_FLOW: { value: ProductStatus; label: string }[] = [
  { value: 'raw',      label: 'RAW' },
  { value: 'edited',   label: '편집됨' },
  { value: 'uploaded', label: '마켓 등록' },
]

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImg, setSelectedImg] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [translating, setTranslating] = useState(false)

  // 인라인 편집
  const [editField, setEditField] = useState<'titleKo' | 'categoryKo' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(json => {
        setProduct(json.data)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (editField) editRef.current?.focus()
  }, [editField])

  function startEdit(field: 'titleKo' | 'categoryKo') {
    setEditField(field)
    setEditValue(product?.[field] ?? '')
  }

  async function saveEdit() {
    if (!editField || !product) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [editField]: editValue }),
      })
      const json = await res.json()
      if (res.ok) setProduct(json.data)
    } finally {
      setSaving(false)
      setEditField(null)
    }
  }

  async function handleStatusChange(status: ProductStatus) {
    if (!product || status === product.status) return
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const json = await res.json()
      if (res.ok) setProduct(json.data)
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleTranslate() {
    setTranslating(true)
    try {
      const res = await fetch(`/api/products/${id}/translate`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) setProduct(json.data)
    } finally {
      setTranslating(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/sourcing')
    } finally {
      setDeleting(false)
    }
  }

  const images = Array.isArray(product?.images) ? product.images : []
  const descImages = Array.isArray(product?.descImages) ? product.descImages : []

  return (
    <AppLayout
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/sourcing" className="text-gray-600 hover:text-gray-900 flex items-center gap-1 font-medium">
              <Icon name="arrow_back" size="sm" />
              소싱
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-500 truncate max-w-xs">
              {product?.titleOriginal ?? '상품 상세'}
            </span>
          </div>

        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      ) : !product ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Icon name="error_outline" size="lg" className="text-gray-200" />
          <p className="text-sm text-gray-400">상품을 찾을 수 없습니다</p>
          <Link href="/sourcing">
            <Button variant="tertiary" size="sm">목록으로</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl mx-auto">

          <div className="flex gap-6 items-start">

            <div className="w-[420px] shrink-0 flex gap-3">

              {images.length > 1 && (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[420px] scrollbar-hide">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`w-[70px] h-[70px] rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        i === selectedImg
                          ? 'border-[#b90a5a]'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden aspect-square">
                {images[selectedImg] ? (
                  <img
                    src={images[selectedImg]}
                    alt={product.titleOriginal}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Icon name="image" size="lg" className="text-gray-200" />
                    <p className="text-xs text-gray-300">이미지 없음</p>
                  </div>
                )}
              </div>

            </div>

            {/* 상품 정보 */}
            <div className="flex-1 min-w-0 space-y-6 py-1">

              {/* 상태 + 제목 */}
              <div className="space-y-3">
                <StatusChip status={product.status} />
                <h1 className="text-lg font-bold text-gray-900 leading-snug">
                  {product.titleOriginal}
                </h1>

                {/* 한국어 제목 인라인 편집 */}
                {editField === 'titleKo' ? (
                  <div className="flex items-center gap-2">
                    <input
                      ref={editRef}
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditField(null) }}
                      placeholder="한국어 제목 입력..."
                      className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                    <button onClick={saveEdit} disabled={saving} className="text-[#b90a5a] hover:opacity-70">
                      {saving ? <Spinner size="sm" /> : <Icon name="check" size="sm" />}
                    </button>
                    <button onClick={() => setEditField(null)} className="text-gray-300 hover:text-gray-500">
                      <Icon name="close" size="sm" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startEdit('titleKo')} className="group flex items-center gap-1.5 text-left w-full">
                    <span className={`text-sm ${product.titleKo ? 'text-gray-500' : 'text-gray-300 italic'}`}>
                      {product.titleKo ?? '한국어 제목 추가...'}
                    </span>
                    <Icon name="edit" size="sm" className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                )}
              </div>

              {/* 가격 */}
              {product.originalPrice && (
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-baseline gap-3">
                    {product.salePrice && Number(product.salePrice) < Number(product.originalPrice) && (
                      <span className="text-2xl font-bold text-[#b90a5a]">
                        {Number(product.salePrice).toLocaleString()}
                        <span className="text-sm font-normal ml-1">{product.currency}</span>
                      </span>
                    )}
                    <span className={`font-bold ${product.salePrice && Number(product.salePrice) < Number(product.originalPrice) ? 'text-base text-gray-400 line-through' : 'text-2xl text-gray-900'}`}>
                      {Number(product.originalPrice).toLocaleString()}
                      <span className="text-sm font-normal ml-1">{product.currency}</span>
                    </span>
                  </div>
                  {product.orders && (
                    <p className="text-xs text-gray-400 mt-1.5">판매 {product.orders}건</p>
                  )}
                </div>
              )}

              {/* 평점 */}
              {product.ratings && (
                <div className="flex items-center gap-2 border-t border-gray-100 pt-5">
                  <span className="text-xl font-bold text-gray-900">{product.ratings.average}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Icon key={s} name="star" size="sm" filled
                        className={Number(product.ratings!.average) >= s ? 'text-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">({product.ratings.total_count.toLocaleString()}개 리뷰)</span>
                </div>
              )}

              {/* 상태 변경 */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                <p className="text-xs font-medium text-gray-400">상태 변경</p>
                <div className="flex gap-2">
                  {STATUS_FLOW.map(s => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      disabled={statusLoading}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                        product.status === s.value
                          ? 'bg-[#b90a5a] text-white border-[#b90a5a]'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                      }`}
                    >
                      {statusLoading && product.status === s.value
                        ? <Spinner size="sm" className="border-white border-t-transparent mx-auto" />
                        : s.label
                      }
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleTranslate}
                  disabled={translating}
                  className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition-colors"
                >
                  {translating ? '번역 중...' : 'AI 번역'}
                </button>
              </div>

              {/* 기본 정보 */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                <p className="text-xs font-medium text-gray-400">상품 정보</p>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
                  <InfoRow label="알리 상품 ID" value={product.aliProductId} />
                  {product.storeInfo?.name && (
                    <InfoRow label="판매자" value={
                      <span className="flex items-center gap-1">
                        {product.storeInfo.name}
                        {product.storeInfo.is_top_rated && (
                          <Icon name="verified" size="sm" className="text-[#b90a5a]" />
                        )}
                      </span>
                    } />
                  )}
                  {product.stock > 0 && <InfoRow label="재고" value={`${product.stock.toLocaleString()}개`} />}
                  {product.categoryAli && <InfoRow label="원본 카테고리" value={product.categoryAli} />}
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-xs text-gray-400 shrink-0">한국 카테고리</span>
                    {editField === 'categoryKo' ? (
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <input
                          ref={editRef}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditField(null) }}
                          placeholder="카테고리 입력..."
                          className="w-40 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-gray-900/10"
                        />
                        <button onClick={saveEdit} disabled={saving} className="text-[#b90a5a]">
                          {saving ? <Spinner size="sm" /> : <Icon name="check" size="sm" />}
                        </button>
                        <button onClick={() => setEditField(null)} className="text-gray-300">
                          <Icon name="close" size="sm" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit('categoryKo')} className="group flex items-center gap-1">
                        <span className={`text-xs ${product.categoryKo ? 'text-gray-700' : 'text-gray-300 italic'}`}>
                          {product.categoryKo ?? '추가...'}
                        </span>
                        <Icon name="edit" size="sm" className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </div>
                  <InfoRow label="이미지" value={`${images.length}장 / 상세 ${descImages.length}장`} />
                  <InfoRow label="수집일" value={new Date(product.createdAt).toLocaleString('ko-KR')} />
                  <InfoRow
                    label="원본"
                    value={
                      <a
                        href={product.sourceUrl ?? `https://www.aliexpress.com/item/${product.aliProductId}.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#b90a5a] hover:underline"
                      >
                        열기 <Icon name="open_in_new" size="sm" />
                      </a>
                    }
                  />
                  <div className="px-4 py-3">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-xs text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                      {deleting ? '삭제 중...' : '이 상품 삭제'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 스펙 표 */}
          {product.specs && product.specs.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-3">
                제품 스펙
                <span className="ml-2 bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-normal">
                  {product.specs.length}항목
                </span>
              </p>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-gray-50">
                    {product.specs.map((spec, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400 font-medium w-1/3 bg-gray-50/50">{spec.name}</td>
                        <td className="px-4 py-2.5 text-gray-700">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 상세 이미지 */}
          {descImages.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-3">
                상세 이미지
                <span className="ml-2 bg-gray-100 text-gray-400 text-[10px] px-2 py-0.5 rounded-full">
                  {descImages.length}
                </span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {descImages.map((src, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <img src={src} alt={`상세 ${i + 1}`} className="w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </AppLayout>
  )
}

