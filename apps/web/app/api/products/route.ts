import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/db/schema'
import { desc } from 'drizzle-orm'

export async function GET() {
  const rows = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .limit(50)

  return NextResponse.json({ data: rows })
}
