from fastapi import FastAPI

app = FastAPI(title="DearStore Market")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "market"}


@app.post("/upload")
async def upload(payload: dict):
    # TODO: 스마트스토어 / 쿠팡 / 11번가 상품 등록
    return {"status": "queued"}


@app.post("/sync/price")
async def sync_price(payload: dict):
    # TODO: 가격·재고 동기화
    return {"status": "queued"}
