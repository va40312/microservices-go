import json
import asyncio
from typing import List, Dict, Any

from fastapi import HTTPException, status
from app.core.clients import http_client, redis_client
from app.core.config import settings


class AnalyzerService:
    def __init__(self):
        self.headers = {"X-Internal-API-Key": settings.internal_api_key}

    async def get_dashboard_data(self) -> Dict[str, Any]:
        """
        Получает данные для дашборда, делая ДВА запроса к Go-сервису ПАРАЛЛЕЛЬНО.
        """
        cache_key = "dashboard_data"
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)

        try:
            stats_resp_task = http_client.get("/internal/stats", headers=self.headers)
            leaderboard_resp_task = http_client.get("/internal/leaderboard", headers=self.headers)

            stats_resp, leaderboard_resp = await asyncio.gather(stats_resp_task, leaderboard_resp_task)

            stats_resp.raise_for_status()
            leaderboard_resp.raise_for_status()

            data = {
                "stats": stats_resp.json(),
                "leaderboard": leaderboard_resp.json()
            }

            await redis_client.set(cache_key, json.dumps(data), ex=30)
            return data

        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Analyzer service unavailable: {e}")

    async def get_trending_videos(self, sort_by: str, platform: str | None, page: int, limit: int) -> Dict[str, Any]:
        """
        Получает пагинированный список видео, проксируя запрос к Go-сервису.
        """
        cache_key = f"trending:{sort_by}:{platform or 'all'}:{page}:{limit}"
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)

        params = {"sort_by": sort_by, "page": page, "limit": limit}
        if platform:
            params["platform"] = platform

        try:
            response = await http_client.get("/internal/trending", headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            await redis_client.set(cache_key, json.dumps(data), ex=30)
            return data
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Analyzer service unavailable: {e}")

    async def get_video_trajectory(self, video_id: str) -> List[Dict[str, Any]]:
        """
        Получает историю снапшотов для одного видео.
        """
        cache_key = f"trajectory:{video_id}"
        cached = await redis_client.get(cache_key)
        if cached:
            return json.loads(cached)

        try:
            response = await http_client.get(f"/internal/video/{video_id}/trajectory", headers=self.headers)
            response.raise_for_status()
            data = response.json()
            await redis_client.set(cache_key, json.dumps(data), ex=300)
            return data
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"Analyzer service unavailable: {e}")

analyzer_service = AnalyzerService()