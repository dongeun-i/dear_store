import ProductCard from '@/components/molecules/ProductCard'

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
  products: Product[]
}

export default function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-16 text-center border border-gray-200">
        <span className="material-symbols-outlined text-[40px] text-gray-200 block mb-3">inventory_2</span>
        <p className="text-sm text-gray-400">아직 수집된 상품이 없습니다</p>
        <p className="text-xs text-gray-300 mt-1">위 URL 입력창에 알리익스프레스 주소를 붙여넣으세요</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
