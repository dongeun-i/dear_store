import Link from 'next/link'
import StatusChip from '@/components/atoms/StatusChip'

type Product = {
  id: string
  titleOriginal: string
  originalPrice: string | null
  currency: string
  images: string[]
  status: 'raw' | 'edited' | 'uploaded'
  createdAt: string
}

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/sourcing/${product.id}`}
      className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.titleOriginal}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-gray-200">image</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{product.titleOriginal}</p>
        <div className="flex items-center justify-between gap-2">
          {product.originalPrice ? (
            <p className="text-sm font-semibold text-[#b90a5a]">
              {Number(product.originalPrice).toLocaleString()}
              <span className="text-[10px] text-gray-400 ml-1 font-normal">{product.currency}</span>
            </p>
          ) : (
            <span className="text-xs text-gray-300">가격 없음</span>
          )}
          <StatusChip status={product.status} />
        </div>
      </div>
    </Link>
  )
}
