from fastapi import FastAPI

app = FastAPI(title="DearStore Processor")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "processor"}


@app.post("/translate")
async def translate(payload: dict):
    # TODO: LLM 번역 (Anthropic API or Ollama)
    return {"status": "queued"}


@app.post("/ocr")
async def ocr(payload: dict):
    # TODO: 이미지 OCR
    return {"status": "queued"}
