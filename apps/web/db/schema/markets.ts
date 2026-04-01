import { pgTable, uuid, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const platformEnum = pgEnum('platform', ['smartstore', 'coupang', '11st'])
export const listingStatusEnum = pgEnum('listing_status', ['pending', 'live', 'paused', 'failed'])

export const marketListings = pgTable('market_listings', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull(),
  platform: platformEnum('platform').notNull(),
  externalId: text('external_id'),
  status: listingStatusEnum('status').default('pending').notNull(),
  listedPrice: text('listed_price'),
  meta: jsonb('meta').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const marketCredentials = pgTable('market_credentials', {
  id: uuid('id').defaultRandom().primaryKey(),
  platform: platformEnum('platform').unique().notNull(),
  credentials: jsonb('credentials').$type<Record<string, string>>().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
