from fastapi import APIRouter, Depends
from typing import List

from app.core.security import check_basic_auth
from app.services.analyzer import analyzer_service
from app.schemas.video import (
    PaginatedVideosResponse, TrajectoryResponse, DashboardResponse
)

router = APIRouter(
    prefix="/videos",
    tags=["Videos"],
    dependencies=[Depends(check_basic_auth)]
)

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard():
    return await analyzer_service.get_dashboard_data()

@router.get("/trending", response_model=PaginatedVideosResponse)
async def get_trending(sort_by: str = "newest", platform: str | None = None, page: int = 1, limit: int = 20):
    return await analyzer_service.get_trending_videos(sort_by, platform, page, limit)

@router.get("/video/{video_id}/trajectory", response_model=TrajectoryResponse)
async def get_trajectory(video_id: str):
    return await analyzer_service.get_video_trajectory(video_id)