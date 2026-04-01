'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Product = {
  id: string
  aliProductId: string
  titleOriginal: string
  titleKo: string | null
  originalPrice: string | null
  currency: string
  images: string[]
  options: Record<string, unknown>
  status: string
  createdAt: string
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [selected, setSelected] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(json => {
        setProduct(json.data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">불러오는 중...</p>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">상품을 찾을 수 없습니다</p>
      </main>
    )
  }

  const images = Array.isArray(product.images) ? product.images : []

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* 뒤로 가기 */}
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
        >
          ← 목록으로
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* 이미지 갤러리 */}
          <div className="space-y-3">
            {/* 메인 이미지 */}
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden aspect-square">
              {images[selected] ? (
                <img
                  src={images[selected]}
                  alt={product.titleOriginal}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-sm">
                  이미지 없음
                </div>
              )}
            </div>

            {/* 썸네일 목록 */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selected ? 'border-pink-300' : 'border-transparent'
                    }`}
                    style={i === selected ? { borderColor: '#FFB3C1' } : {}}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-5">
            {/* 상태 뱃지 */}
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-400 font-medium">
              {product.status}
            </span>

            {/* 제목 */}
            <div className="space-y-1">
              <p className="text-xs text-gray-400">원문 제목</p>
              <h1 className="text-lg font-semibold leading-snug" style={{ color: '#4A4E69' }}>
                {product.titleOriginal}
              </h1>
              {product.titleKo && (
                <p className="text-sm text-gray-500">{product.titleKo}</p>
              )}
            </div>

            {/* 가격 */}
            {product.originalPrice && (
              <div className="space-y-1">
                <p className="text-xs text-gray-400">원가</p>
                <p className="text-2xl font-bold" style={{ color: '#4A4E69' }}>
                  {Number(product.originalPrice).toLocaleString()}
                  <span className="text-sm font-normal text-gray-400 ml-1">{product.currency}</span>
                </p>
              </div>
            )}

            {/* 기본 정보 */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <Row label="알리 상품 ID" value={product.aliProductId} />
              <Row label="이미지 수" value={`${images.length}장`} />
              <Row
                label="수집일"
                value={new Date(product.createdAt).toLocaleString('ko-KR')}
              />
              <Row
                label="알리 링크"
                value={
                  <a
                    href={`https://www.aliexpress.com/item/${product.aliProductId}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    원본 페이지 열기
                  </a>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-xs text-gray-700 text-right">{value}</span>
    </div>
  )
}
