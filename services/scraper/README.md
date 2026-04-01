# DearStore Scraper (M1 소싱)

AliExpress 상품 수집 서비스. mtop API 인터셉션 방식으로 상품 정보·이미지를 수집하고 PostgreSQL + MinIO에 저장한다.

---

## 구조

```
services/scraper/
├── main.py          # FastAPI 앱 + worker 실행 (lifespan)
├── worker.py        # Redis 큐 수신 → 스크래핑 → DB 저장
├── aliexpress.py    # Playwright 스크래퍼 (mtop API 인터셉션)
├── storage.py       # 이미지 다운로드 → EXIF 제거 → MinIO 업로드
├── db.py            # asyncpg DB 접근 (products, scrape_jobs)
├── config.py        # 환경변수 설정 (pydantic-settings)
└── requirements.txt
```

---

## 환경 설정

`apps/web/.env` 를 자동으로 읽는다. 없으면 아래 기본값이 사용된다.

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `DATABASE_URL` | `postgresql://dearstore:dearstore@localhost:5432/dearstore` | PostgreSQL |
| `REDIS_URL` | `redis://localhost:6379` | Redis (BullMQ 큐) |
| `SCRAPE_QUEUE` | `scrape` | 큐 이름 |
| `MINIO_ENDPOINT` | `localhost` | MinIO 호스트 |
| `MINIO_PORT` | `9000` | MinIO 포트 |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO 액세스 키 |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO 시크릿 키 |

---

## 설치 및 실행

### 루트 Makefile 사용 (권장)

```bash
# 최초 1회: 의존성 전체 설치
make install

# 개발 서버 시작 (인프라 + Next.js + Scraper 동시 실행)
make dev
```

### 개별 실행

```bash
cd services/scraper

# 의존성 설치
uv pip install -r requirements.txt

# Playwright 브라우저 설치 (최초 1회)
playwright install chromium

# 개발 서버
uvicorn main:app --reload --port 8001
```

### 헬스 체크

```bash
curl http://localhost:8001/health
# {"status":"ok","service":"scraper"}
```

---

## 스크래핑 동작 방식

```
Redis 큐 (bull:scrape:wait)
  └→ worker.py: 잡 수신
      └→ aliexpress.py
          1. Playwright로 상품 페이지 접속
          2. mtop.aliexpress API 응답 인터셉션 (상품 정보·가격·SKU·이미지)
          3. description URL → httpx로 HTML fetch → img[src|data-src] 파싱
      └→ storage.py
          - 이미지 다운로드 → Pillow EXIF 제거 → MinIO 업로드
          - MinIO bucket: product-images (공개 읽기)
      └→ db.py: products upsert, scrape_jobs 상태 업데이트
```

### 수집 데이터

| 필드 | 저장소 |
|------|--------|
| `ali_product_id`, `title`, `original_price`, `currency`, `options` | PostgreSQL `products` |
| 썸네일 이미지 | MinIO `product-images/products/{id}/` |
| `desc_images` | 반환값에 포함, DB 저장은 추후 스키마 확장 예정 |
| `variants`, `specs`, `shipping`, `store_info` | 반환값에 포함, DB 저장 추후 예정 |

---

## 큐에 잡 넣기

### Next.js UI에서 (권장)
소싱 페이지(`/sourcing`)에서 URL 입력 후 수집 버튼 클릭

### 직접 Redis CLI로

```bash
docker exec dearstore_redis redis-cli LPUSH bull:scrape:wait \
  '{"data":{"url":"https://www.aliexpress.com/item/1005010529983971.html"}}'
```

job_id를 포함할 경우 반드시 UUID 형식이어야 한다:
```json
{
  "data": {
    "url": "https://www.aliexpress.com/item/{상품ID}.html",
    "job_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

---

## Docker

```bash
# 루트에서 인프라만 실행
docker compose up -d postgres redis minio
```
