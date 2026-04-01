from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://dearstore:dearstore@localhost:5432/dearstore"
    redis_url: str = "redis://localhost:6379"
    scrape_queue: str = "scrape"

    minio_endpoint: str = "localhost"
    minio_port: int = 9000
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"

    model_config = {"env_file": "../../apps/web/.env", "extra": "ignore"}


settings = Settings()
