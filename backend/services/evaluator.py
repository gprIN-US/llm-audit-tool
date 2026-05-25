import asyncio
import uuid
import os
from datetime import datetime
from models.schemas import (
    EvaluationRequest, EvaluationResult, ContextMode,
    Domain, JudgeVerdict
)
from services.domain_detector import detect_domain_and_infer_context
from services.hallucination_detector import run_hallucination_check
from services.bias_detector import run_bias_check
from services.quality_scorer import run_quality_check
from services.verdict_generator import generate_verdict
from utils.language_detector import detect_and_translate


RULESET_VERSION = os.getenv("RULESET_VERSION", "v1.0")


async def run_evaluation(request: EvaluationRequest) -> EvaluationResult:
    evaluation_id = str(uuid.uuid4())[:8]

    response_text = request.response_text
    prompt_text = request.prompt_text
    model_name = request.model_name

    translated_text, was_translated, original_language = await detect_and_translate(response_text)
    if was_translated:
        response_text = translated_text

    domain_data = await detect_domain_and_infer_context(response_text)
    domain_str = domain_data.get("domain", "general")
    inferred_prompts = domain_data.get("inferred_prompts", [])

    try:
        domain = Domain(domain_str)
    except ValueError:
        domain = Domain.general

    if prompt_text:
        context_mode = ContextMode.full
    elif inferred_prompts:
        context_mode = ContextMode.inferred
    else:
        context_mode = ContextMode.none

    hallucination_task = run_hallucination_check(response_text, domain, prompt_text)
    bias_task = run_bias_check(response_text, domain, prompt_text)
    quality_task = run_quality_check(response_text, domain, prompt_text)

    hallucination_result, bias_result, quality_result = await asyncio.gather(
        hallucination_task,
        bias_task,
        quality_task
    )

    if was_translated:
        for claim in hallucination_result.claims:
            claim.text = f"[Translated from {original_language}] {claim.text}"
        for flag in bias_result.flags:
            flag.explanation = f"Note: Response was translated from {original_language}. {flag.explanation}"

    verdict_text, passed = generate_verdict(
        hallucination_result,
        bias_result,
        quality_result,
        domain.value
    )

    judge_panel = [
        JudgeVerdict(
            judge_model="gemini-2.0-flash",
            hallucination_score=hallucination_result.score,
            bias_score=bias_result.score,
            quality_score=quality_result.overall_score
        )
    ]

    share_url = f"/audit/{evaluation_id}"

    return EvaluationResult(
        evaluation_id=evaluation_id,
        ruleset_version=RULESET_VERSION,
        context_mode=context_mode,
        domain=domain,
        inferred_prompts=inferred_prompts if context_mode == ContextMode.inferred else None,
        hallucination=hallucination_result,
        bias=bias_result,
        quality=quality_result,
        judge_panel=judge_panel,
        overall_verdict=verdict_text,
        overall_passed=passed,
        share_url=share_url,
        evaluated_at=datetime.utcnow().isoformat(),
        model_evaluated=model_name
    )
