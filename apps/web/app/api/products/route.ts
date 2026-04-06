import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 50), 500)

    const rows = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)

    return NextResponse.json({ data: rows })
  } catch (e) {
    console.error('[GET /api/products]', e)
    return NextResponse.json({ error: 'DB 조회 실패', data: [] }, { status: 500 })
  }
}
