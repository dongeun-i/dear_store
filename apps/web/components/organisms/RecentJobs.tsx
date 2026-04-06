import StatusChip from '@/components/atoms/StatusChip'

type Job = {
  id: string
  url: string
  status: 'pending' | 'running' | 'done' | 'failed'
  error: string | null
  createdAt: string
}

interface Props {
  jobs: Job[]
}

function hostname(url: string) {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/')
    const id = parts[parts.indexOf('item') + 1]?.replace('.html', '')
    return id ? `상품 #${id}` : u.hostname
  } catch {
    return url
  }
}

export default function RecentJobs({ jobs }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-300">
        아직 수집 이력이 없습니다
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {jobs.map(job => (
        <div key={job.id} className="flex items-center gap-3 py-3 px-1">
          <StatusChip status={job.status} />
          <span className="text-sm text-gray-700 flex-1 truncate min-w-0">{hostname(job.url)}</span>
          {job.error && (
            <span className="text-xs text-red-400 truncate max-w-[140px]" title={job.error}>
              {job.error}
            </span>
          )}
          <span className="text-xs text-gray-300 shrink-0 font-mono">
            {new Date(job.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  )
}
