"""
MinIO 이미지 업로드 헬퍼
- AliExpress 이미지 URL → httpx 다운로드 → MinIO 업로드 → 내부 URL 반환
"""

import asyncio
import io
import json
from urllib.parse import urlparse

import httpx
from minio import Minio
from PIL import Image

from config import settings

BUCKET = "product-images"


def _make_client() -> Minio:
    return Minio(
        endpoint=f"{settings.minio_endpoint}:{settings.minio_port}",
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=False,
    )


def _ensure_bucket(client: Minio) -> None:
    if not client.bucket_exists(BUCKET):
        client.make_bucket(BUCKET)
    # 공개 읽기 정책 적용 (이미지 URL 직접 접근 허용)
    policy = {
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"AWS": ["*"]},
            "Action": ["s3:GetObject"],
            "Resource": [f"arn:aws:s3:::{BUCKET}/*"],
        }],
    }
    client.set_bucket_policy(BUCKET, json.dumps(policy))


def _object_name(ali_product_id: str, image_url: str, index: int, prefix: str = "thumbnails") -> str:
    """MinIO 내 오브젝트 경로: {id}/images/{prefix}/{index}_{filename}"""
    filename = urlparse(image_url).path.rsplit("/", 1)[-1]
    if "." not in filename:
        filename = f"{filename}.jpg"
    return f"{ali_product_id}/images/{prefix}/{index:03d}_{filename}"


def _public_url(object_name: str) -> str:
    return f"http://{settings.minio_endpoint}:{settings.minio_port}/{BUCKET}/{object_name}"


async def upload_desc_images(ali_product_id: str, image_urls: list[str]) -> list[str]:
    """상세 이미지 전용 — {id}/images/desc/ 경로에 저장"""
    return await upload_images(ali_product_id, image_urls, prefix="desc")


async def upload_images(
    ali_product_id: str,
    image_urls: list[str],
    prefix: str = "",
) -> list[str]:
    """
    이미지 URL 목록을 MinIO에 업로드하고 내부 URL 목록을 반환.
    prefix: 'desc' 등 하위 폴더 구분용. 비어있으면 루트에 저장.
    실패한 이미지는 원본 URL 그대로 유지.
    """
    if not image_urls:
        return []

    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as http:
        tasks = [
            _upload_one(http, ali_product_id, url, i, prefix)
            for i, url in enumerate(image_urls)
        ]
        return list(await asyncio.gather(*tasks))


def _strip_metadata(data: bytes, content_type: str) -> tuple[bytes, str]:
    """Pillow로 이미지 재저장 → EXIF 등 메타데이터 제거"""
    fmt_map = {"image/jpeg": "JPEG", "image/jpg": "JPEG", "image/png": "PNG", "image/webp": "WEBP"}
    fmt = fmt_map.get(content_type, "JPEG")
    try:
        img = Image.open(io.BytesIO(data))
        out = io.BytesIO()
        img.save(out, format=fmt)
        return out.getvalue(), content_type
    except Exception:
        return data, content_type


async def _upload_one(
    http: httpx.AsyncClient,
    ali_product_id: str,
    image_url: str,
    index: int,
    prefix: str = "",
) -> str:
    try:
        resp = await http.get(image_url)
        resp.raise_for_status()

        content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
        data, content_type = _strip_metadata(resp.content, content_type)
        object_name = _object_name(ali_product_id, image_url, index, prefix)

        # minio SDK는 동기 → thread pool에서 실행
        await asyncio.to_thread(_put_object, data, object_name, content_type)

        return _public_url(object_name)

    except Exception as e:
        print(f"[storage] 이미지 업로드 실패 ({image_url}): {e}")
        return image_url  # 실패 시 원본 URL 유지


def _put_object(data: bytes, object_name: str, content_type: str) -> None:
    client = _make_client()
    _ensure_bucket(client)
    client.put_object(
        bucket_name=BUCKET,
        object_name=object_name,
        data=io.BytesIO(data),
        length=len(data),
        content_type=content_type,
    )
