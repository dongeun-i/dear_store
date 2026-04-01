import { pgTable, uuid, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const qcResultEnum = pgEnum('qc_result', ['pass', 'fail', 'pending'])

export const qcTemplates = pgTable('qc_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryCode: text('category_code').notNull(),
  name: text('name').notNull(),
  checklist: jsonb('checklist').$type<{ id: string; label: string; required: boolean }[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const qcInspections = pgTable('qc_inspections', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: text('order_id').notNull(),
  barcode: text('barcode'),
  templateId: uuid('template_id'),
  result: qcResultEnum('result').default('pending').notNull(),
  checklistResults: jsonb('checklist_results').$type<Record<string, boolean>>().default({}),
  photos: jsonb('photos').$type<string[]>().default([]),
  notes: text('notes'),
  inspectedAt: timestamp('inspected_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
