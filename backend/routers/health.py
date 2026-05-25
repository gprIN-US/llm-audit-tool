from fastapi import APIRouter
from utils.cache import cache_stats
import os

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "ruleset_version": os.getenv("RULESET_VERSION", "v1.0"),
        "cache": cache_stats()
    }
