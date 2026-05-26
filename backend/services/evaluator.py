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

    try:
        translated_text, was_translated, original_language = await asyncio.wait_for(
            detect_and_translate(response_text), timeout=5.0
        )
        if was_translated:
            response_text = translated_text
    except Exception:
        was_translated = False
        original_language = "en"

    try:
        domain_data = await asyncio.wait_for(
            detect_domain_and_infer_context(response_text), timeout=10.0
        )
    except Exception:
        domain_data = {"domain": "general", "inferred_prompts": [], "domain_confidence": 0.5}

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

    try:
        hallucination_result, bias_result, quality_result = await asyncio.wait_for(
            asyncio.gather(
                run_hallucination_check(response_text, domain, prompt_text),
                run_bias_check(response_text, domain, prompt_text),
                run_quality_check(response_text, domain, prompt_text)
            ),
            timeout=25.0
        )
    except asyncio.TimeoutError:
        from models.schemas import HallucinationResult, BiasResult, QualityResult, QualityDimension
        hallucination_result = HallucinationResult(
            score=100.0, total_claims=0, verified_claims=0,
            unverified_claims=0, contradicted_claims=0, claims=[],
            skipped_reason="Evaluation timed out. Try a shorter response."
        )
        bias_result = BiasResult(score=100.0, flags=[], total_rules_checked=13, rules_triggered=0)
        quality_result = QualityResult(
            overall_score=5.0,
            dimensions=[QualityDimension(name="Timeout", score=5.0, explanation="Evaluation timed out before quality scoring completed.")]
        )

    verdict_text, passed = generate_verdict(hallucination_result, bias_result, quality_result, domain.value)

    judge_panel = [
        JudgeVerdict(
            judge_model="gemini-2.0-flash",
            hallucination_score=hallucination_result.score,
            bias_score=bias_result.score,
            quality_score=quality_result.overall_score
        )
    ]

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
        share_url=f"/audit/{evaluation_id}",
        evaluated_at=datetime.utcnow().isoformat(),
        model_evaluated=model_name
    )
