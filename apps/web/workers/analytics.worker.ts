import { createWorker, QUEUE_NAMES } from '@/lib/queue'

const worker = createWorker(QUEUE_NAMES.ANALYTICS, async (job) => {
  console.log(`[analytics.worker] Processing job ${job.id}: ${job.name}`)

  switch (job.name) {
    case 'aggregate-sales':
      // TODO: 판매 집계 로직
      break
    case 'aggregate-settlement':
      // TODO: 정산 집계 로직
      break
    default:
      console.warn(`[analytics.worker] Unknown job name: ${job.name}`)
  }
})

worker.on('completed', (job) => {
  console.log(`[analytics.worker] Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`[analytics.worker] Job ${job?.id} failed:`, err)
})

export default worker
