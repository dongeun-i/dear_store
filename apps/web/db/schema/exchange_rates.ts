import { pgTable, uuid, text, numeric, timestamp } from 'drizzle-orm/pg-core'

export const exchangeRates = pgTable('exchange_rates', {
  id: uuid('id').defaultRandom().primaryKey(),
  currency: text('currency').notNull(),
  rate: numeric('rate', { precision: 12, scale: 6 }).notNull(),
  spread: numeric('spread', { precision: 5, scale: 4 }).default('0.03').notNull(),
  source: text('source'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
})
