import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/db/schema'
import { eq } from 'drizzle-orm'

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const MODEL = 'qwen2.5:7b'

async function askOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  })
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`)
  const json = await res.json()
  return json.message?.content?.trim() ?? ''
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [product] = await db.select().from(products).where(eq(products.id, id))
  if (!product) {
    return NextResponse.json({ error: '상품을 찾을 수 없습니다' }, { status: 404 })
  }

  try {
    const titlePrompt = `당신은 한국 구매대행 쇼핑몰 전문 번역가입니다.
아래 알리익스프레스 상품명을 한국어로 번역해주세요.

규칙:
- 브랜드명·모델명·규격(숫자+단위)은 그대로 유지
- 네이버 쇼핑 검색에 최적화된 자연스러운 한국어로 작성
- 과도한 수식어 제거, 핵심 키워드 위주로 간결하게
- 번역 결과 텍스트만 출력 (설명, 따옴표 없이)

상품명: ${product.titleOriginal}

한국어 번역:`

    const categoryPrompt = product.categoryAli ? `당신은 한국 이커머스 카테고리 분류 전문가입니다.
아래 알리익스프레스 카테고리를 네이버 스마트스토어 카테고리 형식으로 변환해주세요.

규칙:
- 한국어로 작성
- "대분류 > 중분류" 형식으로 출력
- 결과 텍스트만 출력 (설명 없이)

원본 카테고리: ${product.categoryAli}

스마트스토어 카테고리:` : null

    const [titleKo, categoryKo] = await Promise.all([
      askOllama(titlePrompt),
      categoryPrompt ? askOllama(categoryPrompt) : Promise.resolve(null),
    ])

    const updates: Record<string, unknown> = { titleKo, updatedAt: new Date() }
    if (categoryKo) updates.categoryKo = categoryKo

    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning()

    return NextResponse.json({ data: updated })
  } catch (e) {
    console.error('[translate]', e)
    return NextResponse.json({ error: 'AI 번역 실패. Ollama가 실행 중인지 확인하세요.' }, { status: 500 })
  }
}
