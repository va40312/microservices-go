import httpx
from redis import asyncio as aioredis
from app.core.config import settings

# Асинхронный клиент для HTTP-запросов
http_client = httpx.AsyncClient(base_url=str(settings.analyzer_url), timeout=5.0)

# Асинхронный клиент для Redis
redis_client = aioredis.from_url(settings.redis_url, decode_responses=True)