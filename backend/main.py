import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import evaluate, leaderboard, batch, health

app = FastAPI(
    title="LLM Audit Tool",
    description="Evaluates LLM outputs for hallucinations, bias, and quality",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(evaluate.router, prefix="/api", tags=["evaluate"])
app.include_router(leaderboard.router, prefix="/api", tags=["leaderboard"])
app.include_router(batch.router, prefix="/api", tags=["batch"])

if __name__ == "__main__":
    port = int(os.getenv("APP_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
