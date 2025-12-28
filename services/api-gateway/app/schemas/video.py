from pydantic import BaseModel
from typing import List, Dict, Any

# Модель для одного снапшота (для графика)
class Snapshot(BaseModel):
    snapshot_time: str
    stats: Dict[str, Any]

# Модель для пагинации
class Pagination(BaseModel):
    total: int
    page: int
    limit: int

# Модель для видео (остается почти без изменений)
class TrendingVideo(BaseModel):
    video_platform_id: str
    author_username: str
    description: str | None = "" # Сделай необязательным, на всякий случай
    # ... другие поля, которые тебе нужны
    stats: Dict[str, Any] # Просто как словарь

# --- ГЛАВНОЕ ИЗМЕНЕНИЕ ---
# Модель для полного ответа от эндпоинта /trending
class PaginatedTrendingResponse(BaseModel):
    data: List[TrendingVideo]
    pagination: Pagination

class DashboardStats(BaseModel):
    total_assets: int
    status: str

class LeaderboardItem(BaseModel):
    # Поля здесь должны соответствовать тому, что отдает Go
    video_platform_id: str
    author_username: str
    description: str
    # ... и так далее

# --- ВОТ ТО, ЧЕГО НЕ ХВАТАЛО ---
class DashboardResponse(BaseModel):
    stats: DashboardStats
    leaderboard: List[LeaderboardItem]