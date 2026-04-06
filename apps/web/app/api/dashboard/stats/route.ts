import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, scrapeJobs } from '@/db/schema'
import { eq, gte, desc, or, sql } from 'drizzle-orm'

export async function GET() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    productStats,
    todayJobStats,
    activeJobCount,
    recentJobs,
  ] = await Promise.all([
    // 상품 전체 / 상태별 카운트
    db
      .select({ status: products.status, count: sql<number>`count(*)::int` })
      .from(products)
      .groupBy(products.status),

    // 오늘 잡 상태별 카운트
    db
      .select({ status: scrapeJobs.status, count: sql<number>`count(*)::int` })
      .from(scrapeJobs)
      .where(gte(scrapeJobs.createdAt, todayStart))
      .groupBy(scrapeJobs.status),

    // 현재 진행 중 잡 수
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(scrapeJobs)
      .where(or(eq(scrapeJobs.status, 'pending'), eq(scrapeJobs.status, 'running'))),

    // 최근 잡 8개
    db
      .select()
      .from(scrapeJobs)
      .orderBy(desc(scrapeJobs.createdAt))
      .limit(8),
  ])

  // 상품 집계
  const productTotal = productStats.reduce((s, r) => s + r.count, 0)
  const byStatus = Object.fromEntries(productStats.map(r => [r.status, r.count]))

  // 오늘 잡 집계
  const todayByStatus = Object.fromEntries(todayJobStats.map(r => [r.status, r.count]))

  return NextResponse.json({
    data: {
      products: {
        total: productTotal,
        raw: byStatus.raw ?? 0,
        edited: byStatus.edited ?? 0,
        uploaded: byStatus.uploaded ?? 0,
      },
      jobs: {
        todayDone: todayByStatus.done ?? 0,
        todayFailed: todayByStatus.failed ?? 0,
        active: activeJobCount[0]?.count ?? 0,
      },
      recentJobs,
    },
  })
}
