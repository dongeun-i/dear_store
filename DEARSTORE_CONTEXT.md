# DearStore — 프로젝트 컨텍스트

> Claude Code 세션 시작 시 이 파일을 첨부하면 현재 설계 상태를 즉시 이어받을 수 있습니다.
> `claude --context DEARSTORE_CONTEXT.md`

---

## 프로젝트 개요

- **프로젝트명**: DearStore
- **목적**: 해외 상품(알리익스프레스) 소싱 → AI 가공 → 멀티 마켓 등록 → 실물 검수 → 통합 통계까지 아우르는 올인원 구매대행 허브
- **브랜드 컬러**: Soft Pink `#FFB3C1` / Slate Grey `#4A4E69`

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|--------|------|------|
| FE + BE | Next.js (App Router) | API Routes + BullMQ Worker 포함 |
| BG Worker | BullMQ + Redis | 무거운 집계·비동기 작업 |
| Python 서비스 | FastAPI | 스크래퍼 / LLM 가공 / 마켓 API |
| DB | PostgreSQL | Next.js(Drizzle) + Python(asyncpg) 공유 |
| 큐 | Redis | BullMQ(Next.js)와 Python 워커 공용 |
| 스토리지 | MinIO | 검수 사진, 가공 이미지 |
| 스크래핑 | Playwright (Python) + mtop API 인터셉션 | headless Chromium |
| 분석 | Umami | 시스템 트래픽·유입 경로 |
| 인프라 | Docker Compose | 셀프 호스팅 기준 |

---

## 모노레포 디렉토리 구조

```
dearstore/
├── Makefile                      # make install / make dev
├── docker-compose.yml            # postgres / redis / minio
├── apps/
│   └── web/                      # Next.js (FE + API Routes + BullMQ Worker)
│       ├── app/
│       │   ├── (dashboard)/
│       │   ├── (sourcing)/       # ✅ 상품 수집 목록·상세 구현
│       │   ├── (processing)/
│       │   ├── (market)/
│       │   ├── (logistics)/      # 모바일 최적화
│       │   ├── (analytics)/
│       │   └── api/              # ✅ /scrape, /products 구현
│       ├── db/
│       │   └── schema/           # Drizzle 스키마
│       ├── workers/
│       │   └── analytics.worker.ts
│       └── lib/
│           ├── queue.ts
│           ├── db.ts
│           └── minio.ts
│
└── services/
    ├── scraper/                  # ✅ Python — mtop API 인터셉션 구현
    ├── processor/                # Python — LLM 가공 (미구현)
    └── market/                   # Python — 쿠팡·네이버 API (미구현)
```

---

## API 명세

### 통신 원칙
- **REST**: 즉시 응답 필요한 CRUD·상태 조회
- **Redis 큐**: 대량 수집·LLM 가공·마켓 업로드 등 비동기 배치
- **BullMQ Worker**: 대시보드 집계 등 주기적 무거운 쿼리 (Next.js 내부, pm2 실행)

### [AUTH] 인증
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

### [M1] 소싱
```
POST   /api/sourcing/scrape           단일 URL 수집 → Redis 큐
POST   /api/sourcing/scrape/bulk      대량 URL 수집 → Redis 큐
GET    /api/sourcing/jobs             작업 목록·상태
GET    /api/sourcing/jobs/:id
DELETE /api/sourcing/jobs/:id

GET    /api/products                  수집 상품 목록 (필터·페이징)
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

### [M2] 가공
```
POST   /api/processing/translate      AI 번역 → Python LLM 큐
POST   /api/processing/ocr            이미지 OCR → Python LLM 큐
POST   /api/processing/image/banner   배너 일괄 삽입
POST   /api/processing/image/watermark

GET    /api/exchange/rate             현재 환율 (스프레드 적용)
POST   /api/pricing/calculate         판매가 산출
PUT    /api/pricing/settings          마진율·수수료율 저장
GET    /api/category/map              알리 → 국내 카테고리 매핑
```

### [M3] 마켓
```
GET    /api/markets
PUT    /api/markets/:platform/credentials

POST   /api/markets/upload            일괄 등록 → Python 큐
POST   /api/markets/sync/price        가격·재고 동기화 → Python 큐
GET    /api/markets/upload/status
GET    /api/markets/winner/:productId 쿠팡 아이템위너 분석
```

### [M4] 검수
```
GET    /api/qc/templates
POST   /api/qc/templates
PUT    /api/qc/templates/:id

GET    /api/qc/orders/:barcode        바코드 스캔 → 주문 조회
POST   /api/qc/inspect                검수 결과 제출 (합격/불량)
POST   /api/qc/photos                 사진 업로드 → MinIO
GET    /api/qc/inspect/:orderId
```

### [M5] 통계
```
GET    /api/analytics/summary         [BullMQ Worker]
GET    /api/analytics/sales           [BullMQ Worker]
GET    /api/analytics/settlement      [BullMQ Worker]
GET    /api/analytics/traffic         Umami 연동

GET    /api/exchange/history
PUT    /api/exchange/spread
```

### [SYSTEM]
```
GET    /api/system/queue
POST   /api/system/queue/retry
GET    /api/system/health
```

---

## 핵심 비즈니스 로직

### 판매가 산출
```
판매가 = ( (원가 × 전략환율) + 배송비 + 마진 ) ÷ (1 - 플랫폼수수료율)
```
- 역마진 발생 시 Soft Pink 경고 UI 표시
- 플랫폼 수수료율: 스마트스토어 ~2%, 쿠팡 ~10.8%, 11번가 ~12%

### 모바일 검수 파이프라인
```
바코드 스캔 → QC 템플릿 로드 → 체크리스트 수행
→ 사진 촬영 → MinIO 업로드 → 주문 데이터 바인딩 → 합격/불량 판정
```

---

## 구현 로드맵

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 Foundation | Docker, DB, Redis, MinIO, 알리 스크래퍼 | ✅ 완료 (스크래퍼 동작, UI 기본 구현) |
| 2단계 Channel | 마켓 API 연동, 환율 기반 판매가 자동화 | ⏳ 대기 |
| 3단계 Logistics | 모바일 검수 페이지, MinIO 사진 업로드 | ⏳ 대기 |
| 4단계 Intelligence | 판매 데이터 통합 분석, 최저가 추적 | ⏳ 대기 |

---

## 확정된 결정 사항

- **Next.js ORM**: Drizzle (Prisma 사용 금지)
- **스크래핑 방식**: Playwright + mtop.aliexpress API 인터셉션 (SSR runParams 방식 폐기)
- **상세 이미지 수집**: httpx로 description URL HTML fetch → BeautifulSoup img[src|data-src] 파싱
- **이미지 저장**: MinIO `product-images` 버킷 (공개 읽기 정책 적용), Pillow EXIF 제거
- **Python 서비스 구조**: scraper / processor / market 독립 분리
- **개발 실행**: `make dev` (Makefile) — 인프라(Docker) + Next.js + Scraper 동시 실행

## 미결 결정 사항

1. **LLM 가공 방식**: Anthropic API vs 로컬 Ollama
2. **products 테이블 스키마 확장**: `variants`, `specs`, `desc_images`, `shipping` 컬럼 추가 필요
