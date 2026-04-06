import { pgTable, uuid, text, integer, numeric, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const productStatusEnum = pgEnum('product_status', ['raw', 'edited', 'uploaded'])

export type Spec = { name: string; value: string }
export type Rating = { average: string; total_count: number; five_star: number; four_star: number; three_star: number; two_star: number; one_star: number }
export type StoreInfo = { name: string; logo: string; rating: string; rating_count: number; is_top_rated: boolean; store_id?: string; seller_id?: string }

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  aliProductId: text('ali_product_id').unique().notNull(),
  sourceUrl: text('source_url'),

  // 제목
  titleOriginal: text('title_original').notNull(),
  titleKo: text('title_ko'),
  descriptionOriginal: text('description_original'),
  descriptionKo: text('description_ko'),

  // 가격
  originalPrice: numeric('original_price', { precision: 12, scale: 2 }),
  salePrice: numeric('sale_price', { precision: 12, scale: 2 }),
  currency: text('currency').default('CNY'),

  // 이미지
  images: jsonb('images').$type<string[]>().default([]),
  descImages: jsonb('desc_images').$type<string[]>().default([]),

  // 상품 데이터
  options: jsonb('options').$type<Record<string, unknown>[]>().default([]),
  variants: jsonb('variants').$type<Record<string, unknown>[]>().default([]),
  specs: jsonb('specs').$type<Spec[]>().default([]),

  // 판매/재고
  stock: integer('stock').default(0),
  orders: text('orders').default('0'),

  // 평점
  ratings: jsonb('ratings').$type<Rating>(),

  // 판매자
  storeInfo: jsonb('store_info').$type<StoreInfo>(),

  // 카테고리
  categoryAli: text('category_ali'),
  categoryKo: text('category_ko'),

  status: productStatusEnum('status').default('raw').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
