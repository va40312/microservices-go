from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Author(BaseModel):
    username: str
    nickname: str
    followers: int

class VideoStats(BaseModel):
    views: int
    likes: int
    comments: int
    shares: int

class VideoMetrics(BaseModel):
    virality_score: int
    engagement_rate: float

# --- Модель для списка видео (Trend Feed и Leaderboard) ---
class VideoInList(BaseModel):
    id: str = Field(..., alias="_id")
    author: Author
    title: str
    stats: VideoStats
    metrics: VideoMetrics
    published_at: Optional[str] = None
    source: str
    url: str
    video_platform_id: str

# --- Остальные модели ---
class Pagination(BaseModel):
    limit: int
    page: int
    total: int
class PaginatedVideosResponse(BaseModel):
    data: List[VideoInList]
    pagination: Pagination

class Snapshot(BaseModel):
    snapshot_time: str
    stats: VideoStats
    video_id: str

TrajectoryResponse = List[Snapshot]

class DashboardStats(BaseModel):
    total_assets: int
    status: str

class DashboardResponse(BaseModel):
    stats: DashboardStats
    leaderboard: List[VideoInList]