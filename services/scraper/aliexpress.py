"""
AliExpress 상품 스크래퍼 v2
mtop.aliexpress API 인터셉션 방식 (CSR 대응)

참조: aliexpress-product-scraper/src/aliexpressProductScraper.js
      aliexpress-product-scraper/src/parsers.js
"""

import asyncio
import json
import re

import httpx
from bs4 import BeautifulSoup
from playwright.async_api import BrowserContext

from storage import upload_images, upload_desc_images


# ── 메인 엔트리포인트 ──────────────────────────────────────────────────────────

async def scrape_product(url: str, context: BrowserContext) -> dict:
    page = await context.new_page()
    api_data: dict | None = None

    async def _on_response(response):
        nonlocal api_data
        if api_data:
            return
        if "mtop.aliexpress" in response.url and "pdp" in response.url:
            try:
                text = await response.text()
                if len(text) > 1000:
                    parsed = _parse_jsonp(text)
                    if parsed and parsed.get("data", {}).get("result"):
                        api_data = parsed
            except Exception:
                pass

    page.on("response", _on_response)

    try:
        await page.set_extra_http_headers({
            "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        })
        await page.goto(url, wait_until="networkidle", timeout=60_000)

        # networkidle 이후에도 API 응답 대기 (최대 15초)
        for _ in range(30):
            if api_data:
                break
            await asyncio.sleep(0.5)

        if not api_data:
            raise ValueError(f"mtop API 응답 수신 실패: {url}")

        data = _extract_from_api(api_data)
        if not data:
            raise ValueError(f"API 응답 파싱 실패: {url}")

        print(f"[aliexpress] 수집: {data['title'][:50]!r}")

        ali_product_id = _extract_product_id(url)
        desc_url = data.get("desc_url")
        images = data.get("images", [])

    finally:
        await page.close()

    # 썸네일 수집 + 상세 이미지 URL 수집 병렬
    raw_desc_images, stored_images = await asyncio.gather(
        _fetch_description_images(context, desc_url) if desc_url else _noop([]),
        upload_images(ali_product_id, images) if ali_product_id else _noop(images),
    )

    # 상세 이미지 MinIO 업로드 ({id}/images/desc/)
    desc_images = await (
        upload_desc_images(ali_product_id, raw_desc_images)
        if ali_product_id and raw_desc_images
        else _noop([])
    )
    print(f"[aliexpress] 썸네일 {len(stored_images)}장 / 상세 이미지 {len(desc_images)}장 저장 완료")

    return {
        "ali_product_id": ali_product_id,
        "title": data.get("title", ""),
        "category_id": data.get("category_id"),
        "price_min": data.get("price_min"),
        "price_max": data.get("price_max"),
        "sale_price_min": data.get("sale_price_min"),
        "currency": data.get("currency", "KRW"),
        "orders": data.get("orders", "0"),
        "ratings": data.get("ratings", {}),
        "main_image": stored_images[0] if stored_images else None,
        "images": stored_images,
        "desc_images": desc_images,
        "options": data.get("options", []),
        "variants": data.get("variants", []),
        "specs": data.get("specs", []),
        "product_disclosure": data.get("product_disclosure", []),
        "stock": data.get("stock", 0),
        "shipping": data.get("shipping", []),
        "store_info": data.get("store_info", {}),
        "source_url": url,
    }


# ── JSONP 파싱 ─────────────────────────────────────────────────────────────────

def _parse_jsonp(text: str) -> dict | None:
    """mtopjsonpX({...}) 형태 → dict. parsers.js parseJsonp 참조"""
    text = text.strip()
    m = re.match(r"^[a-zA-Z0-9_]+\(([\s\S]+)\)$", text)
    try:
        return json.loads(m.group(1) if m else text)
    except Exception:
        return None


# ── API 응답 → 정규화 dict ──────────────────────────────────────────────────────

def _extract_from_api(api_data: dict) -> dict | None:
    """
    mtop API 응답 → 내부 정규화 dict
    parsers.js extractDataFromApiResponse 참조
    """
    result = api_data.get("data", {}).get("result")
    if not result:
        return None

    global_data = result.get("GLOBAL_DATA", {}).get("globalData", {})

    # 제목
    title = (
        result.get("PRODUCT_TITLE", {}).get("text")
        or global_data.get("subject", "")
    )

    # 썸네일 이미지 목록
    raw_images = result.get("HEADER_IMAGE_PC", {}).get("imagePathList", [])
    images = [
        (img if img.startswith("http") else f"https:{img}").split("?")[0]
        for img in raw_images
        if img
    ]

    # 가격
    price_info = result.get("PRICE", {})
    target_sku = price_info.get("targetSkuPriceInfo", {})
    orig = target_sku.get("originalPrice") or {}
    sale = _get_sale_price(target_sku)
    currency = global_data.get("currencyCode", "KRW")

    price_min = _price_value(orig) or _price_value(sale)
    price_max = price_min

    # SKU 옵션 / variants
    sku = result.get("SKU", {})
    options = _extract_options(sku)
    variants = _extract_variants(sku, price_info)

    # 상품 스펙 + 제품정보공시 (showedProps + props 합산, 중복 제거)
    prop_pc = result.get("PRODUCT_PROP_PC", {})
    seen_keys: set[str] = set()
    specs: list[dict] = []
    for p in (prop_pc.get("showedProps") or []) + (prop_pc.get("props") or []):
        name = p.get("attrName", "")
        value = p.get("attrValue", "")
        if name and name not in seen_keys:
            seen_keys.add(name)
            specs.append({"name": name, "value": value})

    # 제품정보공시 키워드로 별도 분리 (면책조항 포함)
    DISCLOSURE_KEYS = {
        "사업자번호", "사업장소재지", "연락처", "회사 이름", "대표자",
        "이메일 주소", "통신판매업신고번호", "KC인증", "AS센터", "제조국",
        "품질보증기준", "A/S", "면책", "주의사항",
    }
    product_disclosure = [s for s in specs if any(k in s["name"] for k in DISCLOSURE_KEYS)]

    # 재고
    stock = result.get("QUANTITY_PC", {}).get("totalAvailableInventory", 0)

    # 판매 수량
    orders = result.get("TRADE", {}).get("formatTradeCount") or global_data.get("sales", "0")

    # 평점
    rating_data = result.get("PC_RATING", {})
    ratings = {
        "average": rating_data.get("rating", "0"),
        "total_count": rating_data.get("totalValidNum", 0),
        "five_star": rating_data.get("fiveStarNum", 0),
        "four_star": rating_data.get("fourStarNum", 0),
        "three_star": rating_data.get("threeStarNum", 0),
        "two_star": rating_data.get("twoStarNum", 0),
        "one_star": rating_data.get("oneStarNum", 0),
    }

    # 카테고리
    category_id = global_data.get("categoryId")

    # 배송
    shipping = result.get("SHIPPING", {}).get("originalLayoutResultList", [])

    # 판매자
    shop = result.get("SHOP_CARD_PC", {})
    store_info = {
        "name": shop.get("storeName") or global_data.get("storeName", ""),
        "logo": shop.get("logo", ""),
        "rating": shop.get("positiveRate", "0"),
        "rating_count": shop.get("positiveNum", 0),
        "is_top_rated": shop.get("topRatedSeller", False),
        "store_id": global_data.get("storeId"),
        "seller_id": global_data.get("sellerId"),
    }

    # 상세 페이지 URL
    desc = result.get("DESC", {})
    desc_url = desc.get("pcDescUrl") or desc.get("descUrl")

    return {
        "title": title,
        "category_id": category_id,
        "images": images,
        "price_min": price_min,
        "price_max": price_max,
        "sale_price_min": _price_value(_get_sale_price(target_sku)),
        "currency": currency,
        "options": options,
        "variants": variants,
        "specs": specs,
        "product_disclosure": product_disclosure,
        "stock": stock,
        "orders": orders,
        "ratings": ratings,
        "shipping": shipping,
        "store_info": store_info,
        "desc_url": desc_url,
    }


def _get_sale_price(price_info: dict) -> dict | None:
    """parsers.js getSalePrice 참조"""
    if not price_info:
        return None
    return price_info.get("warmUpPrice") or price_info.get("salePrice")


def _price_value(p) -> float | None:
    if not isinstance(p, dict):
        return None
    v = p.get("value")
    if v is None:
        min_amt = p.get("minAmount")
        v = min_amt.get("value") if isinstance(min_amt, dict) else None
    try:
        return float(v) if v is not None else None
    except (TypeError, ValueError):
        return None


def _extract_options(sku: dict) -> list[dict]:
    props = sku.get("skuProperties") or sku.get("productSKUPropertyList") or []
    result = []
    for prop in props:
        values = [
            {
                "id": str(v.get("propertyValueId", "")),
                "name": v.get("propertyValueDisplayName") or v.get("propertyValueName", ""),
                "image": v.get("skuPropertyImagePath") or v.get("image", ""),
            }
            for v in prop.get("skuPropertyValues", [])
        ]
        result.append({
            "id": prop.get("skuPropertyId"),
            "name": prop.get("skuPropertyName", ""),
            "values": values,
        })
    return result


def _extract_variants(sku: dict, price_info: dict) -> list[dict]:
    """parsers.js buildSkuPriceList 참조"""
    sku_paths = sku.get("skuPaths") or {}
    sku_price_map = price_info.get("skuPriceInfoMap") or {}

    if sku_paths and sku_price_map:
        items = sku_paths.values() if isinstance(sku_paths, dict) else sku_paths
        result = []
        for item in items:
            sku_id = str(item.get("skuIdStr") or item.get("skuId", ""))
            price = sku_price_map.get(sku_id) or {}
            result.append({
                "sku_id": item.get("skuId"),
                "option_value_ids": item.get("path", ""),
                "quantity": item.get("skuStock", 0),
                "original_price": price.get("originalPrice"),
                "sale_price": _get_sale_price(price),
            })
        return result

    # fallback: skuPriceList 방식
    result = []
    for item in sku.get("skuPriceList") or price_info.get("skuPriceList") or []:
        val = item.get("skuVal", {})
        result.append({
            "sku_id": item.get("skuId"),
            "option_value_ids": item.get("skuPropIds", ""),
            "quantity": val.get("availQuantity", 0),
            "original_price": val.get("skuAmount"),
            "sale_price": val.get("skuActivityAmount"),
        })
    return result


# ── 상세 페이지 이미지 수집 ────────────────────────────────────────────────────

async def _fetch_description_images(context: BrowserContext, desc_url: str) -> list[str]:
    """
    상세 설명 페이지 HTML 직접 fetch → img[src|data-src] 전체 수집
    lazy load는 렌더링 문제이므로 Playwright 없이 HTML 소스에서 파싱
    """
    try:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            resp = await client.get(
                desc_url,
                headers={"Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"},
            )
            resp.raise_for_status()
            html = resp.text
    except Exception as e:
        print(f"[aliexpress] 상세 이미지 수집 실패: {e}")
        return []

    soup = BeautifulSoup(html, "html.parser")
    urls: list[str] = []
    for img in soup.find_all("img"):
        # data-src 우선 (lazy load용 원본 URL), 없으면 src
        src = img.get("data-src") or img.get("src") or ""
        if not src or "alicdn.com" not in src:
            continue
        src = (src if src.startswith("http") else f"https:{src}").split("?")[0]
        if src not in urls:
            urls.append(src)

    print(f"[aliexpress] 상세 이미지 {len(urls)}장 수집")
    return urls


# ── 헬퍼 ──────────────────────────────────────────────────────────────────────

def _extract_product_id(url: str) -> str | None:
    m = re.search(r"/item/(\d+)", url)
    return m.group(1) if m else None


async def _noop(value):
    return value
