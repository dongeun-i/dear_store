from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio

from worker import start_worker


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(start_worker())
    yield
    task.cancel()


app = FastAPI(title="DearStore Scraper", lifespan=lifespan)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "scraper"}
