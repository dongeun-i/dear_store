# DearStore — Claude Code 자동 컨텍스트

## 프로젝트 개요

- **프로젝트명**: DearStore
- **목적**: 해외 상품(알리익스프레스) 소싱 → AI 가공 → 멀티 마켓 등록 → 실물 검수 → 통합 통계까지 아우르는 올인원 구매대행 허브
- **브랜드 컬러**: Primary Pink `#b90a5a` → `#ff4d8d` / Electric Cyan `#00D1FF` / Slate `#4A4E69`
- **디자인 레퍼런스**: `stitch_global_sourcing_manager/stitch_ledger/DESIGN.md` (Tech Ledger 디자인 시스템)

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
| 스크래핑 | Playwright (Python) | Docker, headless Chromium |
| 분석 | Umami | 시스템 트래픽·유입 경로 |
| 인프라 | Docker Compose | 셀프 호스팅 기준 |

---

## 확정된 기술 결정

- **Next.js ORM**: **Drizzle** (Prisma 사용 금지 — 타입 안전성, Edge Runtime 호환, 번들 경량)
- **DB 접근**: Next.js → Drizzle / Python → asyncpg
- **FE 개발 방법론**: **CDD (Component-Driven Development) + Atomic Design Pattern**

---

## 프론트엔드 개발 원칙 (CDD + Atomic Design)

### 컴포넌트 디렉토리 구조

```
apps/web/components/
├── atoms/          # 최소 단위 — Button, Badge, Input, Icon, Chip, Spinner, Avatar
├── molecules/      # atoms 조합 — SearchBar, MetricCard, StatusBadge, FormField
├── organisms/      # 독립 UI 블록 — Sidebar, Header, DataTable, ProductCard, SupplyTicker
├── templates/      # 레이아웃 뼈대 — DashboardLayout, MobileLayout, AuthLayout
└── ui/             # shadcn/ui 기반 기본 컴포넌트 (필요 시)
```

### Atomic 계층 규칙

| 계층 | 특징 | 예시 |
|------|------|------|
| **Atoms** | Props만 받고 자체 상태·API 호출 없음 | `<Button>`, `<StatusChip>`, `<MetricValue>` |
| **Molecules** | atoms 2개 이상 조합, 로컬 상태 허용 | `<SearchInput>`, `<ProductMeta>` |
| **Organisms** | 실제 데이터 바인딩, 훅 사용 가능 | `<Sidebar>`, `<SourcingFeed>` |
| **Templates** | 레이아웃만 정의, 슬롯(children) 중심 | `<DashboardLayout>` |
| **Pages** | `app/` 디렉토리의 page.tsx — 조립만 담당 | |

### 컴포넌트 파일 규칙

- 파일명: PascalCase (`StatusChip.tsx`)
- 1파일 1컴포넌트 원칙
- Props 타입은 파일 내 `interface Props` 로 선언
- `'use client'` 는 Organisms 이상에서만 사용, atoms/molecules는 Server Component 우선

---

## 디자인 시스템 (Tech Ledger — "Kinetic Curator")

> 전체 스펙: `stitch_global_sourcing_manager/stitch_ledger/DESIGN.md`

### 핵심 컬러 토큰

| 토큰 | 값 | 용도 |
|------|----|------|
| `primary` | `#b90a5a` | 주요 강조, 액센트 바 |
| `primary-container` | `#ff4d8d` | 그라디언트 끝 |
| `secondary` | `#00677f` | 인터랙티브 아이콘, 레이블 태그 |
| `background` | `#fef8fa` | 페이지 캔버스 |
| `surface` | `#fef8fa` | 기본 서피스 |
| `surface-container-low` | `#f8f2f4` | 사이드바·보조 영역 |
| `surface-container-lowest` | `#ffffff` | 인터랙티브 카드 |
| `inverse-surface` | `#323031` | 다크 오버레이·알림 |
| `on-surface-variant` | `#594046` | 보조 본문 텍스트 |

### 핵심 디자인 규칙

- **No-Line Rule**: `1px solid` 경계선 금지 — 배경색 shift로 구분
- **Ghost Border**: 경계가 필요하면 `outline-variant` 20% opacity만 허용
- **Glassmorphism**: 모달·드롭다운 → `surface-container-lowest` 70% + `backdrop-blur: 24px`
- **그림자 색**: 항상 핑크 tint `rgba(185, 10, 90, 0.06)` — 검정 그림자 금지
- **CTA 그라디언트**: `#b90a5a → #ff4d8d`, 135도
- **Success 색**: Electric Cyan `#00D1FF` (초록 금지)
- **폰트**: Manrope / 아이콘: Material Symbols Outlined

### 컴포넌트별 규칙

```
Button Primary  : gradient(#b90a5a → #ff4d8d) · white text · rounded-lg
Button Secondary: bg #00ccf9 · text #005266
Button Tertiary : transparent · primary text · no border

StatusChip      : pill-shape · "In Progress" → #b7eaff · "Review" → #ffd9e0
Input           : bg #ece7e9 · no underline · focus: 2px ghost border #00677f
Card            : bg #ffffff · no divider · 4px left bar #b90a5a (active)
Modal           : backdrop-blur-2xl · bg rgba(255,255,255,0.7)
```

---

## 언어·레이어 분리 원칙

- **Next.js**: FE, API Routes(CRUD·인증·상태조회), BullMQ Worker(집계·주기작업)
- **Python**: Playwright 스크래핑, LLM 호출, 이미지 가공, 쿠팡·네이버 API 연동
- CPU·시간이 오래 걸리는 작업은 Next.js에서 처리하지 않고 Python 큐로 넘긴다

---

## 통신 원칙

| 패턴 | 사용 시점 |
|------|----------|
| REST (Route Handler 직접) | 즉시 응답 필요한 CRUD·조회 |
| Redis 큐 → Python 워커 | 대량 수집, LLM 가공, 마켓 업로드 등 배치 |
| BullMQ Worker (pm2) | 대시보드 집계 등 주기적 무거운 쿼리 |

---

## 모노레포 디렉토리 구조

```
dearstore/
├── apps/
│   └── web/                      # Next.js (FE + API Routes + BullMQ Worker)
│       ├── app/
│       │   ├── (dashboard)/
│       │   ├── (sourcing)/
│       │   ├── (processing)/
│       │   ├── (market)/
│       │   ├── (logistics)/      # 모바일 최적화
│       │   ├── (analytics)/
│       │   └── api/
│       ├── components/           # Atomic Design 컴포넌트
│       │   ├── atoms/            # Button, Badge, Input, Icon, Chip, Spinner
│       │   ├── molecules/        # SearchBar, MetricCard, FormField
│       │   ├── organisms/        # Sidebar, Header, DataTable, ProductCard
│       │   └── templates/        # DashboardLayout, MobileLayout
│       ├── workers/
│       │   └── analytics.worker.ts
│       └── lib/
│           ├── queue.ts
│           ├── db.ts
│           └── minio.ts
│
└── services/
    ├── scraper/                  # Python — Playwright
    ├── processor/                # Python — LLM 가공
    └── market/                   # Python — 쿠팡·네이버 API
```

---

## API 응답 형식 통일

```typescript
// 성공
{ data: T, meta?: { total: number, page: number } }

// 에러
{ error: string, code?: string }
```

## 기능 모듈 요약

| 모듈 | 담당 | 핵심 작업 |
|------|------|----------|
| M1 소싱 | Python scraper | Playwright, Redis 큐, 중복 필터 |
| M2 가공 | Python processor | LLM 번역·OCR, 이미지 배너·워터마크, 환율 계산 |
| M3 마켓 | Python market | 스마트스토어·쿠팡·11번가 API, 가격 동기화 |
| M4 검수 | Next.js (모바일) | 바코드 스캔, QC 체크리스트, MinIO 사진 업로드 |
| M5 통계 | Next.js BullMQ | 판매 집계, 환율 이력, Umami 트래픽 |

---

## DB 핵심 테이블

```
products          ali_product_id UNIQUE, status: raw/edited/uploaded
scrape_jobs       status: pending/done/failed, retry_count
qc_templates      category_code, checklist JSONB
qc_inspections    order_id, result: pass/fail, photos JSONB
market_listings   product_id, platform, external_id, status
exchange_rates    currency, rate, spread, recorded_at
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
| 1단계 Foundation | Docker, DB, Redis, MinIO, 알리 스크래퍼 | 진행 중 |
| 2단계 Channel | 마켓 API 연동, 환율 기반 판매가 자동화 | 대기 |
| 3단계 Logistics | 모바일 검수 페이지, MinIO 사진 업로드 | 대기 |
| 4단계 Intelligence | 판매 데이터 통합 분석, 최저가 추적 | 대기 |

---

## 미결 결정 사항

1. **LLM 가공 방식**: Anthropic API vs 로컬 Ollama
2. **Python 서비스 구조**: scraper / processor / market 독립 분리 vs 단일 FastAPI 앱
