'use client'

import { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/templates/AppLayout'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ProductGrid from '@/components/organisms/ProductGrid'
import Spinner from '@/components/atoms/Spinner'

type Product = {
  id: string
  aliProductId: string
  titleOriginal: string
  originalPrice: string | null
  currency: string
  images: string[]
  status: 'raw' | 'edited' | 'uploaded'
  createdAt: string
}

export default function SourcingPage() {
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [collecting, setCollecting] = useState(false)

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products')
    const json = await res.json()
    setProducts(json.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
    const id = setInterval(fetchProducts, 5000)
    return () => clearInterval(id)
  }, [fetchProducts])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setSubmitting(true)
    setCollecting(true)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        alert(json.error ?? '오류가 발생했습니다')
        return
      }
      setUrl('')
    } finally {
      setSubmitting(false)
      setTimeout(() => setCollecting(false), 3000)
    }
  }

  return (
    <AppLayout
      header={
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-900">제품 소싱</h2>
          {collecting && (
            <span className="flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
              <Spinner size="sm" className="border-gray-400 border-t-transparent" />
              수집 요청됨
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-5">

        {/* URL 입력 */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://www.aliexpress.com/item/..."
              />
            </div>
            <Button
              type="submit"
              disabled={submitting || !url.trim()}
              loading={submitting}
              className="shrink-0 self-end"
            >
              수집 시작
            </Button>
          </form>
        </div>

        {/* 상품 목록 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-700">수집된 상품</p>
            {products.length > 0 && (
              <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>

      </div>
    </AppLayout>
  )
}
