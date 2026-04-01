import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { scrapeJobs } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { createQueue, QUEUE_NAMES } from '@/lib/queue'

function normalizeAliUrl(raw: string): string | null {
  const m = raw.match(/\/item\/(\d+)/)
  if (!m) return null
  return `https://www.aliexpress.com/item/${m[1]}.html`
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  const normalized = url ? normalizeAliUrl(url) : null
  if (!normalized) {
    return NextResponse.json({ error: '유효한 AliExpress 상품 URL을 입력해주세요' }, { status: 400 })
  }

  const [job] = await db.insert(scrapeJobs).values({ url: normalized }).returning()

  const queue = createQueue(QUEUE_NAMES.SCRAPE)
  await queue.add('scrape', { url, job_id: job.id })
  await queue.close()

  return NextResponse.json({ data: job })
}

export async function GET() {
  const jobs = await db
    .select()
    .from(scrapeJobs)
    .orderBy(desc(scrapeJobs.createdAt))
    .limit(20)

  return NextResponse.json({ data: jobs })
}
