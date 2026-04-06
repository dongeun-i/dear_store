"""asyncpg를 이용한 DB 접근 레이어 — 실제 Drizzle 스키마 기준"""

import json
import asyncpg
from config import settings


async def get_conn() -> asyncpg.Connection:
    return await asyncpg.connect(settings.database_url)


async def upsert_product(conn: asyncpg.Connection, product: dict) -> str:
    """products 테이블에 INSERT or UPDATE, 저장된 id(uuid) 반환"""
    row = await conn.fetchrow(
        """
        INSERT INTO products (
            ali_product_id,
            source_url,
            title_original,
            original_price,
            sale_price,
            currency,
            images,
            desc_images,
            options,
            variants,
            specs,
            stock,
            orders,
            ratings,
            store_info,
            status,
            updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'raw',NOW())
        ON CONFLICT (ali_product_id) DO UPDATE SET
            source_url     = EXCLUDED.source_url,
            title_original = EXCLUDED.title_original,
            original_price = EXCLUDED.original_price,
            sale_price     = EXCLUDED.sale_price,
            currency       = EXCLUDED.currency,
            images         = EXCLUDED.images,
            desc_images    = EXCLUDED.desc_images,
            options        = EXCLUDED.options,
            variants       = EXCLUDED.variants,
            specs          = EXCLUDED.specs,
            stock          = EXCLUDED.stock,
            orders         = EXCLUDED.orders,
            ratings        = EXCLUDED.ratings,
            store_info     = EXCLUDED.store_info,
            updated_at     = NOW()
        RETURNING id
        """,
        product["ali_product_id"],
        product.get("source_url"),
        product["title"],
        product.get("price_min"),
        product.get("sale_price_min"),
        product["currency"],
        json.dumps(product["images"]),
        json.dumps(product.get("desc_images", [])),
        json.dumps(product.get("options", [])),
        json.dumps(product.get("variants", [])),
        json.dumps(product.get("specs", [])),
        product.get("stock", 0),
        str(product.get("orders", "0")),
        json.dumps(product.get("ratings")),
        json.dumps(product.get("store_info")),
    )
    return str(row["id"])


async def update_scrape_job(
    conn: asyncpg.Connection,
    job_id: str,
    *,
    status: str,
    product_id: str | None = None,
    error_message: str | None = None,
) -> None:
    await conn.execute(
        """
        UPDATE scrape_jobs
        SET status     = $2::job_status,
            product_id = $3::uuid,
            error      = $4,
            updated_at = NOW()
        WHERE id = $1::uuid
        """,
        job_id,
        status,
        product_id,
        error_message,
    )
