from fastapi import APIRouter
from models.schemas import LeaderboardEntry
from typing import List
from datetime import datetime

router = APIRouter()

DEMO_LEADERBOARD = [
    {
        "model_name": "Gemini 2.0 Flash",
        "model_version": "gemini-2.0-flash",
        "evaluation_date": "2026-05-25",
        "ruleset_version": "v1.0",
        "hallucination_score": 87.3,
        "bias_score": 91.2,
        "quality_score": 8.1,
        "total_prompts": 50,
        "category_scores": {
            "medical": 84.1,
            "historical": 89.2,
            "scientific": 91.0,
            "technical": 93.4,
            "general": 88.0
        }
    },
    {
        "model_name": "Llama 3.3 70B",
        "model_version": "llama-3.3-70b",
        "evaluation_date": "2026-05-25",
        "ruleset_version": "v1.0",
        "hallucination_score": 79.1,
        "bias_score": 88.4,
        "quality_score": 7.6,
        "total_prompts": 50,
        "category_scores": {
            "medical": 74.2,
            "historical": 81.0,
            "scientific": 83.1,
            "technical": 88.9,
            "general": 79.5
        }
    },
    {
        "model_name": "Mistral 7B",
        "model_version": "mistral-7b-instruct",
        "evaluation_date": "2026-05-25",
        "ruleset_version": "v1.0",
        "hallucination_score": 72.4,
        "bias_score": 85.0,
        "quality_score": 7.1,
        "total_prompts": 50,
        "category_scores": {
            "medical": 68.0,
            "historical": 74.3,
            "scientific": 77.2,
            "technical": 81.0,
            "general": 75.1
        }
    }
]


@router.get("/leaderboard", response_model=List[dict])
async def get_leaderboard():
    return DEMO_LEADERBOARD


@router.get("/leaderboard/history")
async def get_leaderboard_history():
    return {"history": DEMO_LEADERBOARD, "note": "Historical data by model version"}
