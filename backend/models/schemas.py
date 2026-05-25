from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class ContextMode(str, Enum):
    full = "full"
    inferred = "inferred"
    none = "none"


class Domain(str, Enum):
    medical = "medical"
    legal = "legal"
    financial = "financial"
    scientific = "scientific"
    historical = "historical"
    technical = "technical"
    political = "political"
    cultural = "cultural"
    educational = "educational"
    creative = "creative"
    opinion = "opinion"
    general = "general"


class EvaluationRequest(BaseModel):
    response_text: str = Field(..., min_length=10, description="The LLM response to evaluate")
    prompt_text: Optional[str] = Field(None, description="The original prompt that generated the response")
    model_name: Optional[str] = Field(None, description="Which model produced this response")


class Claim(BaseModel):
    text: str
    verdict: str
    confidence: float
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    source_tier: Optional[int] = None
    conflicting_source: Optional[str] = None


class HallucinationResult(BaseModel):
    score: float
    total_claims: int
    verified_claims: int
    unverified_claims: int
    contradicted_claims: int
    claims: List[Claim]
    skipped_reason: Optional[str] = None


class BiasFlag(BaseModel):
    rule_id: str
    rule_name: str
    triggered_text: str
    explanation: str
    neutral_alternative: Optional[str] = None
    confidence: float


class BiasResult(BaseModel):
    score: float
    flags: List[BiasFlag]
    total_rules_checked: int
    rules_triggered: int


class QualityDimension(BaseModel):
    name: str
    score: float
    explanation: str


class QualityResult(BaseModel):
    overall_score: float
    dimensions: List[QualityDimension]


class JudgeVerdict(BaseModel):
    judge_model: str
    hallucination_score: float
    bias_score: float
    quality_score: float


class EvaluationResult(BaseModel):
    evaluation_id: str
    ruleset_version: str
    context_mode: ContextMode
    domain: Domain
    inferred_prompts: Optional[List[str]] = None
    hallucination: HallucinationResult
    bias: BiasResult
    quality: QualityResult
    judge_panel: List[JudgeVerdict]
    overall_verdict: str
    overall_passed: bool
    share_url: str
    evaluated_at: str
    model_evaluated: Optional[str] = None


class InferContextRequest(BaseModel):
    response_text: str


class InferContextResponse(BaseModel):
    inferred_prompts: List[str]
    detected_domain: Domain


class BatchEvaluationRequest(BaseModel):
    items: List[EvaluationRequest]


class BatchEvaluationResponse(BaseModel):
    batch_id: str
    total: int
    status: str


class LeaderboardEntry(BaseModel):
    model_name: str
    model_version: str
    evaluation_date: str
    ruleset_version: str
    hallucination_score: float
    bias_score: float
    quality_score: float
    total_prompts: int
    category_scores: dict
