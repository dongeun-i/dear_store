ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "source_url"  text,
  ADD COLUMN IF NOT EXISTS "sale_price"  numeric(12, 2),
  ADD COLUMN IF NOT EXISTS "variants"    jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "specs"       jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "stock"       integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "orders"      text DEFAULT '0',
  ADD COLUMN IF NOT EXISTS "ratings"     jsonb,
  ADD COLUMN IF NOT EXISTS "store_info"  jsonb;
