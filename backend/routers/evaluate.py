from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from models.schemas import EvaluationRequest, EvaluationResult, InferContextRequest, InferContextResponse
from services.evaluator import run_evaluation
from services.domain_detector import detect_domain_and_infer_context
from utils.cache import get_cached_result, set_cached_result
from models.schemas import Domain

router = APIRouter()


@router.post("/evaluate", response_model=EvaluationResult)
async def evaluate(request: EvaluationRequest):
    cached = get_cached_result(request.response_text, request.prompt_text)
    if cached:
        return JSONResponse(content=cached)

    try:
        result = await run_evaluation(request)
        result_dict = result.model_dump()
        set_cached_result(request.response_text, result_dict, request.prompt_text)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}. Please try again."
        )


@router.post("/infer-context", response_model=InferContextResponse)
async def infer_context(request: InferContextRequest):
    try:
        result = await detect_domain_and_infer_context(request.response_text)
        domain_str = result.get("domain", "general")
        try:
            domain = Domain(domain_str)
        except ValueError:
            domain = Domain.general

        return InferContextResponse(
            inferred_prompts=result.get("inferred_prompts", []),
            detected_domain=domain
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audit/{evaluation_id}")
async def get_audit(evaluation_id: str):
    return {"evaluation_id": evaluation_id, "message": "Shared audit result"}
