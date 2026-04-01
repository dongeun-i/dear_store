---
name: dearstore
description: DearStore 프로젝트 전용 스킬. 코드 작성, 설계 결정, API 구현, 아키텍처 논의 시 사용. Next.js(FE+BE) + Python(스크래핑·LLM·마켓) 구조의 구매대행 허브 프로젝트. FE는 CDD + Atomic Design 패턴 준수.
---

# DearStore 프로젝트 스킬

## FE 컴포넌트 개발 원칙 (CDD + Atomic Design)

### 작업 전 체크: 어느 계층에 만들 것인가?

| 질문 | 답 → 계층 |
|------|----------|
| Props만 받고 아무것도 모르는가? | → **Atoms** |
| Atoms 2개 이상 조합하고 간단한 상태가 있는가? | → **Molecules** |
| 실제 데이터·훅을 쓰는 독립 UI 블록인가? | → **Organisms** |
| 레이아웃 뼈대만 제공하는가? | → **Templates** |

### 컴포넌트 생성 규칙

```typescript
// atoms/Button.tsx — 예시
interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

// primary variant: gradient bg-[#b90a5a] to-[#ff4d8d] 135deg
// secondary variant: bg-[#00ccf9] text-[#005266]
// tertiary variant: transparent, primary text, no border
```

### 디자인 토큰 — Tailwind 클래스 매핑

```
primary 버튼    : bg-gradient-to-br from-[#b90a5a] to-[#ff4d8d] text-white rounded-lg
보조 텍스트     : text-[#594046]
카드 배경       : bg-white (surface-container-lowest)
페이지 배경     : bg-[#fef8fa]
사이드바 배경   : bg-[#f8f2f4]
액티브 카드 바  : border-l-4 border-[#b90a5a]
In Progress 칩 : bg-[#b7eaff] text-[#005266] rounded-full
인풋 배경       : bg-[#ece7e9] border-none focus:ring-2 focus:ring-[#00677f]
모달            : bg-white/70 backdrop-blur-2xl
```

### 금지 사항

- `border border-gray-200` 같은 solid 경계선 사용 금지
- `shadow-black` 또는 순수 검정 그림자 금지 → `shadow-[rgba(185,10,90,0.06)]` 사용
- `text-green-500` success 색 금지 → Electric Cyan `#00D1FF` 또는 primary pink 사용
- divider line (`<hr>`, `border-b`) 금지 → 여백(`gap-6`, `space-y-6`)으로 구분

### 폴더 구조

```
apps/web/components/
├── atoms/
│   ├── Button.tsx
│   ├── Badge.tsx       # StatusChip (pill)
│   ├── Input.tsx
│   ├── Icon.tsx        # Material Symbols wrapper
│   ├── Spinner.tsx
│   └── MetricValue.tsx # 대형 수치 표시 (Display typography)
├── molecules/
│   ├── SearchBar.tsx
│   ├── MetricCard.tsx
│   ├── FormField.tsx
│   └── ProductMeta.tsx
├── organisms/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── DataTable.tsx
│   ├── ProductCard.tsx
│   └── SupplyTicker.tsx  # 실시간 소싱 스크롤 티커
└── templates/
    ├── DashboardLayout.tsx
    └── MobileLayout.tsx
```

## 언어·레이어 분리 원칙

- **Next.js**: FE, API Routes(CRUD·인증·상태조회), BullMQ Worker(집계·주기작업)
- **Python**: Playwright 스크래핑, LLM 호출, 이미지 가공, 쿠팡·네이버 API 연동
- CPU·시간이 오래 걸리는 작업은 Next.js에서 처리하지 않고 Python 큐로 넘긴다

## 통신 원칙

| 패턴 | 사용 시점 |
|------|----------|
| REST (Route Handler 직접) | 즉시 응답 필요한 CRUD·조회 |
| Redis 큐 → Python 워커 | 대량 수집, LLM 가공, 마켓 업로드 등 배치 |
| BullMQ Worker (pm2) | 대시보드 집계 등 주기적 무거운 쿼리 |

## 기능 모듈 요약

| 모듈 | 담당 | 핵심 작업 |
|------|------|----------|
| M1 소싱 | Python scraper | Playwright, Redis 큐, 중복 필터 |
| M2 가공 | Python processor | LLM 번역·OCR, 이미지 배너·워터마크, 환율 계산 |
| M3 마켓 | Python market | 스마트스토어·쿠팡·11번가 API, 가격 동기화 |
| M4 검수 | Next.js (모바일) | 바코드 스캔, QC 체크리스트, MinIO 사진 업로드 |
| M5 통계 | Next.js BullMQ | 판매 집계, 환율 이력, Umami 트래픽 |

## DB 접근

- **Next.js**: **Drizzle** (확정 — Prisma 사용 금지)
- **Python**: asyncpg 직접 사용
- 같은 PostgreSQL 인스턴스 공유

## API 응답 형식 통일

```typescript
// 성공
{ data: T, meta?: { total: number, page: number } }

// 에러
{ error: string, code?: string }
```

## DB 핵심 테이블

```
products          ali_product_id UNIQUE, status: raw/edited/uploaded
scrape_jobs       status: pending/done/failed, retry_count
qc_templates      category_code, checklist JSONB
qc_inspections    order_id, result: pass/fail, photos JSONB
market_listings   product_id, platform, external_id, status
exchange_rates    currency, rate, spread, recorded_at
```

## 작업 시작 전 체크리스트

1. **어느 레이어?** — Next.js vs Python 서비스
2. **동기 vs 비동기?** — REST vs Redis 큐
3. **어느 모듈?** — API prefix 결정 (`/api/sourcing/`, `/api/qc/` 등)
4. **미결 사항 확인** — 아래 참고

## 미결 결정 사항 (작업 전 확인)

- **LLM 가공 방식**: Anthropic API vs 로컬 Ollama
- **Python 서비스 구조**: 독립 분리(scraper/processor/market) — 확정, 단일 앱 아님
