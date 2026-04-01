import { Queue, Worker, type ConnectionOptions } from 'bullmq'

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'
const { hostname, port } = new URL(redisUrl)

const connection: ConnectionOptions = {
  host: hostname,
  port: Number(port || 6379),
}

// Queue 팩토리
export function createQueue(name: string) {
  return new Queue(name, { connection })
}

// Worker 팩토리
export function createWorker(
  name: string,
  processor: Parameters<typeof Worker>[1],
) {
  return new Worker(name, processor, { connection })
}

// 큐 이름 상수
export const QUEUE_NAMES = {
  SCRAPE: 'scrape',
  PROCESS: 'process',
  MARKET_UPLOAD: 'market-upload',
  ANALYTICS: 'analytics',
} as const
