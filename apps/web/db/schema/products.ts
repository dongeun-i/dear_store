import { pgTable, uuid, text, integer, numeric, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const productStatusEnum = pgEnum('product_status', ['raw', 'edited', 'uploaded'])

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  aliProductId: text('ali_product_id').unique().notNull(),
  titleOriginal: text('title_original').notNull(),
  titleKo: text('title_ko'),
  descriptionOriginal: text('description_original'),
  descriptionKo: text('description_ko'),
  originalPrice: numeric('original_price', { precision: 12, scale: 2 }),
  currency: text('currency').default('CNY'),
  images: jsonb('images').$type<string[]>().default([]),
  descImages: jsonb('desc_images').$type<string[]>().default([]),
  options: jsonb('options').$type<Record<string, unknown>>().default({}),
  categoryAli: text('category_ali'),
  categoryKo: text('category_ko'),
  status: productStatusEnum('status').default('raw').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
