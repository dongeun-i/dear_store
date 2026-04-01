# DearStore

알리익스프레스 상품 소싱 → AI 가공 → 멀티 마켓 자동 등록까지 아우르는 구매대행 올인원 허브

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| FE + BE | Next.js 15 (App Router + API Routes) |
| ORM | Drizzle ORM |
| DB | PostgreSQL 16 |
| BG Worker | BullMQ + Redis 7 |
| Python 서비스 | FastAPI (스크래퍼 / LLM 가공 / 마켓 API) |
| 스크래핑 | Playwright (headless Chromium) |
| 스토리지 | MinIO (이미지) |
| 인프라 | Docker Compose |

---

## 프로젝트 구조

```
dearstore/
├── apps/
│   └── web/                      # Next.js — FE + API Routes + BullMQ Worker
│       ├── app/                  # App Router 페이지 (dashboard/sourcing/qc/…)
│       ├── db/                   # Drizzle 스키마 & 마이그레이션
│       ├── lib/                  # db, queue, minio 클라이언트
│       └── workers/              # BullMQ 워커 (analytics 등)
│
├── services/
│   ├── scraper/                  # Python — 알리 스크래퍼 (:8001)
│   │   ├── aliexpress.py         # 상품 파싱 (runParams 추출)
│   │   ├── storage.py            # MinIO 이미지 업로드
│   │   ├── db.py                 # asyncpg products upsert
│   │   ├── worker.py             # Redis 큐 워커
│   │   ├── config.py             # 환경변수 (pydantic-settings)
│   │   └── main.py               # FastAPI 앱
│   ├── processor/                # Python — LLM 번역·OCR·이미지 가공 (:8002)
│   └── market/                   # Python — 스마트스토어·쿠팡·11번가 API (:8003)
│
└── infra/
    └── db/
        └── schema.sql            # products, scrape_jobs 초기 DDL
```

---

## 시작하기

### 사전 요구사항

- Node.js >= 20, pnpm >= 9
- Python >= 3.11, uv
- Docker

### 1. 인프라 실행 (PostgreSQL · Redis · MinIO)

```bash
docker compose up -d
```

| 서비스 | 주소 |
|--------|------|
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
| MinIO API | localhost:9000 |
| MinIO Console | localhost:9001 (minioadmin / minioadmin) |

### 2. DB 스키마 적용

`psql`이 로컬에 없을 경우 Docker로 실행:

```bash
docker exec -i dearstore_postgres psql -U dearstore -d dearstore -f - < infra/db/schema.sql
```

### 3. Next.js 설정

```bash
pnpm install
cp apps/web/.env.example apps/web/.env   # 환경변수 설정
pnpm db:generate
pnpm db:migrate
pnpm dev
# → http://localhost:5173
```

### 4. 스크래퍼 서비스 실행

```bash
cd services/scraper
uv pip install -e .
playwright install chromium
uvicorn main:app --port 8001 --reload
```

---

## 소싱 플로우

```
알리 상품 URL 입력
  → POST /api/sourcing/scrape
  → Redis 큐 (bull:scrape:wait)
  → Python scraper worker
      ├── Playwright로 상품 페이지 열기
      ├── window.runParams 에서 상품 데이터 추출
      │     (제목, 가격, 이미지, 옵션, 재고, 설명 HTML)
      ├── 이미지 → MinIO product-images 버킷 업로드
      │     경로: products/{ali_product_id}/001_img.jpg
      └── products 테이블 upsert (status: raw)
```

---

## DB 주요 테이블

| 테이블 | 설명 |
|--------|------|
| `products` | 수집 상품 — `ali_product_id UNIQUE`, `status: raw/edited/uploaded` |
| `scrape_jobs` | 수집 작업 — `status: pending/done/failed`, `retry_count` |
| `qc_templates` | 검수 체크리스트 템플릿 |
| `qc_inspections` | 검수 결과 (pass/fail, 사진 MinIO 경로) |
| `market_listings` | 마켓 등록 현황 (smartstore/coupang/11st) |
| `exchange_rates` | 환율 이력 (스프레드 포함) |

---

## API 엔드포인트 요약

| 모듈 | Prefix | 비고 |
|------|--------|------|
| 인증 | `/api/auth` | JWT |
| M1 소싱 | `/api/sourcing`, `/api/products` | Redis 큐 |
| M2 가공 | `/api/processing`, `/api/pricing`, `/api/exchange` | Redis 큐 |
| M3 마켓 | `/api/markets` | Redis 큐 |
| M4 검수 | `/api/qc` | 모바일 최적화 |
| M5 통계 | `/api/analytics` | BullMQ Worker |
| 시스템 | `/api/system` | 큐 상태·헬스체크 |

API 응답 형식:
```json
{ "data": {}, "meta": { "total": 0, "page": 1 } }
{ "error": "메시지", "code": "ERROR_CODE" }
```

---

## 판매가 산출 공식

```
판매가 = ( (원가 × 전략환율) + 배송비 + 마진 ) ÷ (1 - 플랫폼수수료율)
```

| 플랫폼 | 수수료율 |
|--------|---------|
| 스마트스토어 | ~2% |
| 쿠팡 | ~10.8% |
| 11번가 | ~12% |

역마진 발생 시 UI 경고 표시

---

## 구현 로드맵

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 Foundation | Docker, DB, Redis, MinIO, 알리 스크래퍼 | 진행 중 |
| 2단계 Channel | 마켓 API 연동, 환율 기반 판매가 자동화 | 대기 |
| 3단계 Logistics | 모바일 검수 페이지, MinIO 사진 업로드 | 대기 |
| 4단계 Intelligence | 판매 데이터 통합 분석, 최저가 추적 | 대기 |
