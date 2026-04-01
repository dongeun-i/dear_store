import asyncio
import json

import asyncpg
import redis.asyncio as aioredis
from playwright.async_api import async_playwright

from aliexpress import scrape_product
from config import settings
from db import get_conn, upsert_product, update_scrape_job


async def start_worker():
    redis = aioredis.from_url(settings.redis_url)
    queue_key = f"bull:{settings.scrape_queue}:wait"
    print(f"[scraper.worker] Listening on {queue_key}")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-blink-features=AutomationControlled"],
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )

        try:
            while True:
                await _process_next(redis, context, queue_key)
        finally:
            await context.close()
            await browser.close()
            await redis.aclose()


async def _process_next(redis, context, queue_key: str):
    try:
        result = await redis.brpop(queue_key, timeout=5)
        if not result:
            return

        # BullMQ wait 리스트에는 잡 ID(숫자)만 들어있음
        # 실제 잡 데이터는 bull:{queue}:{id} 해시에 별도 저장
        _, bull_job_id = result
        queue_name = queue_key.split(":")[1]  # bull:scrape:wait → scrape
        job_hash_key = f"bull:{queue_name}:{bull_job_id.decode() if isinstance(bull_job_id, bytes) else bull_job_id}"

        raw_data = await redis.hget(job_hash_key, "data")
        if not raw_data:
            print(f"[scraper.worker] 잡 데이터 없음: {job_hash_key}")
            return

        job_data = json.loads(raw_data)
        url: str | None = job_data.get("url")
        job_id: str | None = job_data.get("job_id")

        if not url:
            print("[scraper.worker] URL 없음, 스킵")
            return

        print(f"[scraper.worker] 스크랩 시작: {url}")
        conn: asyncpg.Connection = await get_conn()

        try:
            product = await scrape_product(url, context)
            product_id = await upsert_product(conn, product)

            if job_id:
                await update_scrape_job(conn, job_id, status="done", product_id=product_id)

            print(f"[scraper.worker] 완료 — product_id={product_id} title={product['title'][:40]!r}")

        except Exception as e:
            print(f"[scraper.worker] 오류: {e}")
            if job_id:
                await update_scrape_job(conn, job_id, status="failed", error_message=str(e))

        finally:
            await conn.close()

    except Exception as e:
        print(f"[scraper.worker] 큐 처리 오류: {e}")
        await asyncio.sleep(1)
