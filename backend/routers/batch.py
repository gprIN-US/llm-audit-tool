import asyncio
import uuid
from fastapi import APIRouter, HTTPException
from models.schemas import BatchEvaluationRequest, BatchEvaluationResponse, EvaluationRequest
from services.evaluator import run_evaluation

router = APIRouter()

_batch_jobs = {}


@router.post("/batch", response_model=BatchEvaluationResponse)
async def start_batch(request: BatchEvaluationRequest):
    if len(request.items) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 items per batch")

    batch_id = str(uuid.uuid4())[:8]
    _batch_jobs[batch_id] = {
        "status": "processing",
        "total": len(request.items),
        "completed": 0,
        "results": []
    }

    asyncio.create_task(_process_batch(batch_id, request.items))

    return BatchEvaluationResponse(
        batch_id=batch_id,
        total=len(request.items),
        status="processing"
    )


async def _process_batch(batch_id: str, items: list):
    results = []
    for item in items:
        try:
            result = await run_evaluation(item)
            results.append(result.model_dump())
            _batch_jobs[batch_id]["completed"] += 1
        except Exception as e:
            results.append({"error": str(e), "item": item.model_dump()})
            _batch_jobs[batch_id]["completed"] += 1

    _batch_jobs[batch_id]["status"] = "completed"
    _batch_jobs[batch_id]["results"] = results


@router.get("/batch/{batch_id}")
async def get_batch_status(batch_id: str):
    job = _batch_jobs.get(batch_id)
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")
    return job
