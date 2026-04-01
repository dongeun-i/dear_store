import StatusChip from '@/components/atoms/StatusChip'
import Icon from '@/components/atoms/Icon'

type ScrapeJob = {
  id: string
  url: string
  status: 'pending' | 'running' | 'done' | 'failed'
  error: string | null
  createdAt: string
}

interface Props {
  job: ScrapeJob
  onCancel?: (id: string) => void
}

export default function ScrapeJobItem({ job, onCancel }: Props) {
  const time = new Date(job.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl group">
      <StatusChip status={job.status} />

      <span className="text-sm text-[#1d1b1d] truncate flex-1 min-w-0">{job.url}</span>

      {job.error && (
        <span className="text-xs text-[#b90a5a] truncate max-w-[200px]" title={job.error}>
          {job.error}
        </span>
      )}

      <span className="text-[11px] text-[#594046]/50 font-mono shrink-0">{time}</span>

      {job.status === 'pending' && onCancel && (
        <button
          onClick={() => onCancel(job.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-[#594046]/40 hover:text-[#b90a5a]"
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  )
}
