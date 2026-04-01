'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type ScrapeJob = {
  id: string
  url: string
  status: 'pending' | 'running' | 'done' | 'failed'
  error: string | null
  createdAt: string
}

type Product = {
  id: string
  aliProductId: string
  titleOriginal: string
  originalPrice: string | null
  currency: string
  images: string[]
  status: string
  createdAt: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: '대기',
  running: '수집 중',
  done: '완료',
  failed: '실패',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  running: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export default function SourcingPage() {
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [jobs, setJobs] = useState<ScrapeJob[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const fetchJobs = useCallback(async () => {
    const res = await fetch('/api/scrape')
    const json = await res.json()
    setJobs(json.data ?? [])
  }, [])

  const fetchProducts = useCallback(async () => {
    const res = await fetch('/api/products')
    const json = await res.json()
    setProducts(json.data ?? [])
  }, [])

  useEffect(() => {
    fetchJobs()
    fetchProducts()
    const id = setInterval(() => {
      fetchJobs()
      fetchProducts()
    }, 5000)
    return () => clearInterval(id)
  }, [fetchJobs, fetchProducts])

  async function handleCancel(jobId: string) {
    await fetch(`/api/scrape/${jobId}`, { method: 'DELETE' })
    fetchJobs()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setSubmitting(true)
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
      fetchJobs()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#4A4E69' }}>소싱</h1>
          <p className="text-sm text-gray-400 mt-1">AliExpress 상품 URL을 입력하면 자동으로 수집합니다</p>
        </div>

        {/* URL 입력 */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.aliexpress.com/item/..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
          />
          <button
            type="submit"
            disabled={submitting || !url.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: '#FFB3C1' }}
          >
            {submitting ? '요청 중...' : '수집 시작'}
          </button>
        </form>

        {/* 수집 작업 현황 */}
        {jobs.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 mb-3">수집 작업</h2>
            <div className="space-y-2">
              {jobs.map(job => (
                <div key={job.id} className="bg-white border border-gray-100 rounded-lg px-4 py-3 flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[job.status]}`}>
                    {STATUS_LABEL[job.status]}
                  </span>
                  <span className="text-sm text-gray-600 truncate flex-1">{job.url}</span>
                  {job.error && (
                    <span className="text-xs text-red-400 truncate max-w-xs">{job.error}</span>
                  )}
                  <span className="text-xs text-gray-300 shrink-0">
                    {new Date(job.createdAt).toLocaleTimeString('ko-KR')}
                  </span>
                  {job.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(job.id)}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    >
                      취소
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 수집된 상품 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3">
            수집된 상품 {products.length > 0 && <span className="text-gray-300">({products.length})</span>}
          </h2>

          {products.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-lg p-12 text-center text-sm text-gray-300">
              아직 수집된 상품이 없습니다
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map(product => (
                <Link key={product.id} href={`/sourcing/${product.id}`} className="block bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.titleOriginal}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-50 flex items-center justify-center text-gray-200 text-xs">
                      이미지 없음
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{product.titleOriginal}</p>
                    {product.originalPrice && (
                      <p className="text-sm font-semibold" style={{ color: '#4A4E69' }}>
                        {Number(product.originalPrice).toLocaleString()} {product.currency}
                      </p>
                    )}
                    <span className="inline-block text-xs px-1.5 py-0.5 rounded bg-gray-50 text-gray-400">
                      {product.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
