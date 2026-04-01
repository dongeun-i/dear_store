.PHONY: install dev infra infra-down

SCRAPER_DIR := services/scraper
WEB_DIR     := apps/web

# ── 의존성 설치 ────────────────────────────────────────────────
install:
	@echo "[install] Node.js 패키지 설치..."
	pnpm install
	@echo "[install] Python 패키지 설치..."
	cd $(SCRAPER_DIR) && uv pip install -r requirements.txt
	@echo "[install] Playwright 브라우저 설치..."
	cd $(SCRAPER_DIR) && .venv/bin/playwright install chromium
	@echo "[install] 완료"

# ── 인프라 (Docker) ────────────────────────────────────────────
infra:
	docker compose up -d postgres redis minio
	@echo "[infra] PostgreSQL / Redis / MinIO 시작됨"

infra-down:
	docker compose down

# ── 개발 서버 (Next.js + Python scraper 동시 실행) ──────────────
dev: infra
	@trap 'kill 0' SIGINT SIGTERM; \
	(cd $(WEB_DIR) && pnpm dev 2>&1 | sed "s/^/[web]   /") & \
	(cd $(SCRAPER_DIR) && .venv/bin/uvicorn main:app --reload --port 8001 2>&1 | sed "s/^/[scraper] /") & \
	wait
