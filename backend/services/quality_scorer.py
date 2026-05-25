import os
import json
from google import genai
from models.schemas import QualityResult, QualityDimension, Domain

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

FILLER_PHRASES = ["great question", "certainly!", "of course!", "absolutely!", "sure!", "i'd be happy to", "excellent question", "as an ai", "as a language model"]

QUALITY_DIMENSIONS = [
    {"name": "Coherence", "description": "Logical structure, sentences connect meaningfully", "weight": 1.0, "skip_without_context": False},
    {"name": "Relevance", "description": "Every paragraph addresses the prompt", "weight": 1.5, "skip_without_context": True},
    {"name": "Completeness", "description": "Covers key dimensions a knowledgeable person would expect", "weight": 1.3, "skip_without_context": True},
    {"name": "Conciseness", "description": "No unnecessary padding or repetition", "weight": 0.8, "skip_without_context": False},
    {"name": "Accuracy Confidence", "description": "Appropriate confidence level for the topic certainty", "weight": 1.5, "skip_without_context": False},
    {"name": "Actionability", "description": "For advice prompts, gives specific actionable steps", "weight": 1.0, "skip_without_context": True},
    {"name": "Hedging Appropriateness", "description": "Hedges on uncertain topics, confident on established facts", "weight": 1.0, "skip_without_context": False},
    {"name": "Source Transparency", "description": "Makes clear what it is drawing on vs speculating", "weight": 1.2, "skip_without_context": False},
]


async def run_quality_check(response_text: str, domain: Domain, prompt_text: str = None) -> QualityResult:
    has_context = prompt_text is not None
    filler_found = [p for p in FILLER_PHRASES if p in response_text.lower()]
    applicable = [d for d in QUALITY_DIMENSIONS if not (d["skip_without_context"] and not has_context)]
    dims_desc = "\n".join([f"{d['name']}: {d['description']}" for d in applicable])
    context_note = f"Original prompt: {prompt_text}" if has_context else "No original prompt. Skip context-dependent dimensions."

    prompt = f"""You are a quality evaluator for AI responses. Score each dimension from 1 to 10.

{context_note}

Response:
"{response_text[:2000]}"

Score each dimension:
{dims_desc}

Return ONLY a JSON object, no markdown:
{{
  "dimensions": [
    {{
      "name": "exact dimension name",
      "score": 1-10,
      "explanation": "one sentence explaining this score"
    }}
  ]
}}

Be honest and critical. 9-10 is exceptional. 7-8 is good. 5-6 has noticeable issues. 3-4 has significant issues. 1-2 fails completely."""

    try:
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        quality_data = json.loads(text.strip())
        raw_dims = quality_data.get("dimensions", [])
    except Exception as e:
        print(f"Quality check error: {e}")
        raw_dims = []

    dimension_objects = []
    total_weighted = 0.0
    total_weight = 0.0

    for raw in raw_dims:
        config = next((d for d in QUALITY_DIMENSIONS if d["name"] == raw.get("name")), {"weight": 1.0})
        score = max(1.0, min(10.0, float(raw.get("score", 5))))
        weight = config.get("weight", 1.0)
        dimension_objects.append(QualityDimension(name=raw.get("name", ""), score=score, explanation=raw.get("explanation", "")))
        total_weighted += score * weight
        total_weight += weight

    if filler_found:
        padding_score = max(1.0, 7.0 - len(filler_found) * 2)
        dimension_objects.append(QualityDimension(name="Padding Detection", score=padding_score, explanation=f"Found filler phrases: {', '.join(filler_found[:3])}"))
        total_weighted += padding_score * 0.7
        total_weight += 0.7

    overall = round(total_weighted / total_weight, 1) if total_weight > 0 else 5.0
    return QualityResult(overall_score=overall, dimensions=dimension_objects)
