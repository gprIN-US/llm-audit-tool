import os
import json
import google.generativeai as genai
from models.schemas import QualityResult, QualityDimension, Domain

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")


QUALITY_DIMENSIONS = [
    {
        "name": "Coherence",
        "description": "Does the response follow a logical structure? Does each sentence connect to the one before it?",
        "weight": 1.0,
        "skip_without_context": False
    },
    {
        "name": "Relevance",
        "description": "Does every paragraph actually address the original prompt? Off topic content is penalized.",
        "weight": 1.5,
        "skip_without_context": True
    },
    {
        "name": "Completeness",
        "description": "Given the complexity of the prompt, did the response cover the key dimensions a knowledgeable person would expect?",
        "weight": 1.3,
        "skip_without_context": True
    },
    {
        "name": "Conciseness",
        "description": "Is there unnecessary padding, repetition, or filler phrases like great question or certainly?",
        "weight": 0.8,
        "skip_without_context": False
    },
    {
        "name": "Accuracy Confidence",
        "description": "Does the response speak with appropriate confidence? Overconfident language on uncertain topics scores lower.",
        "weight": 1.5,
        "skip_without_context": False
    },
    {
        "name": "Actionability",
        "description": "For advice or instruction prompts, does the response give things the user can actually do rather than being vague?",
        "weight": 1.0,
        "skip_without_context": True
    },
    {
        "name": "Hedging Appropriateness",
        "description": "Does the response hedge in the right places? Under hedging on uncertain topics and over hedging on established facts both score lower.",
        "weight": 1.0,
        "skip_without_context": False
    },
    {
        "name": "Tone Match",
        "description": "Does the tone match what the prompt was asking for? A casual prompt getting a formal academic response scores lower.",
        "weight": 0.8,
        "skip_without_context": True
    },
    {
        "name": "Source Transparency",
        "description": "Does the response make clear what it is drawing on or does it present everything with equal confidence regardless of how speculative it is?",
        "weight": 1.2,
        "skip_without_context": False
    },
    {
        "name": "Padding Detection",
        "description": "Are there filler openings like great question, certainly, or of course that add no value?",
        "weight": 0.7,
        "skip_without_context": False
    }
]

FILLER_PHRASES = [
    "great question", "certainly!", "of course!", "absolutely!",
    "sure!", "i'd be happy to", "i would be delighted",
    "excellent question", "that's a great", "wonderful question",
    "as an ai", "as a language model", "i don't have feelings but"
]


def detect_filler(response_text: str) -> list:
    text_lower = response_text.lower()
    found = [phrase for phrase in FILLER_PHRASES if phrase in text_lower]
    return found


async def run_quality_check(
    response_text: str,
    domain: Domain,
    prompt_text: str = None
) -> QualityResult:

    has_context = prompt_text is not None
    filler_found = detect_filler(response_text)

    applicable_dims = [
        d for d in QUALITY_DIMENSIONS
        if not (d["skip_without_context"] and not has_context)
    ]

    dims_description = "\n".join([
        f"{d['name']}: {d['description']}"
        for d in applicable_dims
        if d["name"] != "Padding Detection"
    ])

    context_note = f"Original prompt: {prompt_text}" if has_context else "No original prompt provided. Skip context-dependent dimensions."

    prompt = f"""You are a quality evaluator for AI responses. Score each dimension from 1 to 10.

{context_note}

Response to evaluate:
"{response_text[:2000]}"

Score each of these dimensions:
{dims_description}

Return ONLY a JSON object, no markdown, no backticks:
{{
  "dimensions": [
    {{
      "name": "dimension name exactly as listed",
      "score": 1-10,
      "explanation": "one sentence explaining this specific score"
    }}
  ]
}}

Scoring guide:
- 9-10: exceptional, publishable quality
- 7-8: good, minor issues
- 5-6: acceptable but noticeable problems
- 3-4: significant issues
- 1-2: fails this dimension entirely

Be honest and critical. Do not default to 7 for everything."""

    try:
        result = model.generate_content(prompt)
        text = result.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        quality_data = json.loads(text.strip())
        raw_dimensions = quality_data.get("dimensions", [])
    except Exception:
        raw_dimensions = []

    dimension_objects = []
    total_weighted_score = 0.0
    total_weight = 0.0

    for raw_dim in raw_dimensions:
        dim_config = next(
            (d for d in QUALITY_DIMENSIONS if d["name"] == raw_dim.get("name")),
            {"weight": 1.0}
        )
        score = max(1.0, min(10.0, float(raw_dim.get("score", 5))))
        weight = dim_config.get("weight", 1.0)

        dimension_objects.append(QualityDimension(
            name=raw_dim.get("name", "Unknown"),
            score=score,
            explanation=raw_dim.get("explanation", "")
        ))

        total_weighted_score += score * weight
        total_weight += weight

    if filler_found:
        padding_score = max(1.0, 7.0 - (len(filler_found) * 2))
        explanation = f"Found filler phrases: {', '.join(filler_found[:3])}. These add no value and reduce response quality."
        dimension_objects.append(QualityDimension(
            name="Padding Detection",
            score=padding_score,
            explanation=explanation
        ))
        total_weighted_score += padding_score * 0.7
        total_weight += 0.7

    if total_weight == 0:
        overall_score = 5.0
    else:
        overall_score = round(total_weighted_score / total_weight, 1)

    return QualityResult(
        overall_score=overall_score,
        dimensions=dimension_objects
    )
