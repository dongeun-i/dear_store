import Icon from '@/components/atoms/Icon'

interface Props {
  icon: string
  label: string
  value: number | string
  sub?: string
  accent?: boolean
}

export default function KpiCard({ icon, label, value, sub, accent = false }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-[#ffd9e0]' : 'bg-gray-100'}`}>
          <Icon name={icon} size="sm" className={accent ? 'text-[#b90a5a]' : 'text-gray-500'} />
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-[#b90a5a]' : 'text-gray-900'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
