import hashlib
import json
from typing import Optional
from datetime import datetime, timedelta

_cache = {}
CACHE_TTL_HOURS = 24


def _make_key(response_text: str, prompt_text: Optional[str] = None) -> str:
    content = response_text + (prompt_text or "")
    return hashlib.sha256(content.encode()).hexdigest()


def get_cached_result(response_text: str, prompt_text: Optional[str] = None) -> Optional[dict]:
    key = _make_key(response_text, prompt_text)
    entry = _cache.get(key)
    if not entry:
        return None
    if datetime.utcnow() > entry["expires_at"]:
        del _cache[key]
        return None
    return entry["result"]


def set_cached_result(response_text: str, result: dict, prompt_text: Optional[str] = None):
    key = _make_key(response_text, prompt_text)
    _cache[key] = {
        "result": result,
        "expires_at": datetime.utcnow() + timedelta(hours=CACHE_TTL_HOURS)
    }


def cache_stats() -> dict:
    return {
        "total_cached": len(_cache),
        "cache_ttl_hours": CACHE_TTL_HOURS
    }
