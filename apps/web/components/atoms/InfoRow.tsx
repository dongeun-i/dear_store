interface Props {
  label: string
  value: React.ReactNode
}

export default function InfoRow({ label, value }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-xs text-gray-700 text-right">{value}</span>
    </div>
  )
}
