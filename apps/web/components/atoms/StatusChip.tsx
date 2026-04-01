type Status = 'pending' | 'running' | 'done' | 'failed' | 'raw' | 'edited' | 'uploaded'

interface Props {
  status: Status
  className?: string
}

const CONFIG: Record<Status, { label: string; className: string }> = {
  pending:  { label: '대기',    className: 'bg-[#ffd9e0] text-[#b90a5a]' },
  running:  { label: '수집 중', className: 'bg-[#b7eaff] text-[#005266]' },
  done:     { label: '완료',    className: 'bg-[#b7eaff] text-[#005266]' },
  failed:   { label: '실패',    className: 'bg-[#ffd9e0] text-[#b90a5a]' },
  raw:      { label: 'RAW',     className: 'bg-[#f3f4f6] text-[#594046]' },
  edited:   { label: '편집됨',  className: 'bg-[#b7eaff] text-[#005266]' },
  uploaded: { label: '등록됨',  className: 'bg-[#ffd9e0] text-[#b90a5a]' },
}

export default function StatusChip({ status, className = '' }: Props) {
  const cfg = CONFIG[status] ?? CONFIG.raw
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${cfg.className} ${className}`}>
      {cfg.label}
    </span>
  )
}
