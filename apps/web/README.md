# DearStore Web (Next.js)

FE + API Routes + BullMQ Worker를 담당하는 Next.js App Router 앱.

---

## 구조

```
apps/web/
├── app/
│   ├── (dashboard)/          # 대시보드 홈
│   ├── (sourcing)/
│   │   └── sourcing/
│   │       ├── page.tsx      # 상품 수집 목록 + URL 입력
│   │       └── [id]/
│   │           └── page.tsx  # 상품 상세 (이미지 미리보기)
│   └── api/
│       ├── scrape/route.ts   # POST: Redis 큐에 수집 잡 등록
│       └── products/
│           ├── route.ts      # GET: 상품 목록
│           └── [id]/route.ts # GET: 상품 상세
├── db/
│   ├── schema/               # Drizzle 스키마
│   │   ├── products.ts
│   │   ├── scrape_jobs.ts
│   │   ├── markets.ts
│   │   ├── qc.ts
│   │   └── exchange_rates.ts
│   └── migrations/           # SQL 마이그레이션
├── lib/
│   ├── db.ts                 # Drizzle 클라이언트
│   ├── queue.ts              # BullMQ 큐/워커 팩토리
│   └── minio.ts              # MinIO 클라이언트
└── workers/
    └── analytics.worker.ts   # 집계 BullMQ 워커
```

---

## 환경 설정

`apps/web/.env` 파일:

```env
# PostgreSQL
DATABASE_URL=postgresql://dearstore:dearstore@localhost:5432/dearstore

# Redis
REDIS_URL=redis://localhost:6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_QC=qc-photos
MINIO_BUCKET_PRODUCTS=product-images

# Python Services
SCRAPER_SERVICE_URL=http://localhost:8001
```

---

## 설치 및 실행

### 루트 Makefile 사용 (권장)

```bash
# 루트에서
make install   # 전체 의존성 설치
make dev       # 인프라 + 전체 서비스 동시 실행
```

### 개별 실행

```bash
cd apps/web
pnpm install
pnpm dev       # http://localhost:3000
```

### DB 마이그레이션

```bash
# 루트에서
pnpm db:generate   # 스키마 변경 → SQL 생성
pnpm db:migrate    # 마이그레이션 실행
pnpm db:studio     # Drizzle Studio (DB 브라우저)
```

---

## API Routes

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/scrape` | 알리 URL → Redis 큐 등록 |
| `GET` | `/api/products` | 수집 상품 목록 (페이징) |
| `GET` | `/api/products/:id` | 상품 상세 |

### POST /api/scrape

```json
{ "url": "https://www.aliexpress.com/item/1005010529983971.html" }
```

응답:
```json
{ "data": { "jobId": "uuid", "url": "..." } }
```

---

## 주요 페이지

| 경로 | 설명 |
|------|------|
| `/` | 대시보드 |
| `/sourcing` | 수집 목록 + URL 입력 + 잡 상태 |
| `/sourcing/:id` | 상품 상세 (썸네일 갤러리, 스펙, 가격) |
