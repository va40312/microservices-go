from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title="TrendPulse API Gateway",
    description="API Gateway for the TrendPulse microservice ecosystem.",
    version="1.0.4-beta"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)

@app.get("/health")
async def health_check():
    return {"status": "ok"}