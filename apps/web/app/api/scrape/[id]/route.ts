import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { scrapeJobs } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const [job] = await db
    .update(scrapeJobs)
    .set({ status: 'failed', error: '사용자가 취소했습니다' })
    .where(and(eq(scrapeJobs.id, id), eq(scrapeJobs.status, 'pending')))
    .returning()

  if (!job) {
    return NextResponse.json({ error: '취소할 수 없는 작업입니다 (대기 상태가 아님)' }, { status: 400 })
  }

  return NextResponse.json({ data: job })
}
