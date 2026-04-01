-- DearStore 초기 스키마
-- 실행: psql -U dearstore -d dearstore -f infra/db/schema.sql

CREATE TABLE IF NOT EXISTS products (
    id                  SERIAL PRIMARY KEY,
    ali_product_id      VARCHAR(64) UNIQUE NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'raw',  -- raw / edited / uploaded
    title               TEXT,
    price_min           NUMERIC(12, 2),
    price_max           NUMERIC(12, 2),
    currency            VARCHAR(10) DEFAULT 'USD',
    main_image          TEXT,
    images              JSONB NOT NULL DEFAULT '[]',   -- 이미지 URL 배열
    options             JSONB NOT NULL DEFAULT '[]',   -- [{name, values:[{id,name,image}]}]
    stock               INTEGER,
    description_html    TEXT,
    source_url          TEXT,
    raw_data            JSONB,                         -- 원본 runParams 전체 보관
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scrape_jobs (
    id              SERIAL PRIMARY KEY,
    url             TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending / done / failed
    product_id      INTEGER REFERENCES products(id),
    error_message   TEXT,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON scrape_jobs(status);
