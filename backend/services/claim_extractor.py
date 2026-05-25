import os
import json
from google import genai
from models.schemas import Domain

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

IMPLICIT_CLAIM_PATTERNS = [
    "as everyone knows", "obviously", "it is well established", "studies show",
    "research indicates", "scientists agree", "experts say", "it is a fact",
    "clearly", "undeniably", "as we all know", "it has been proven"
]


def should_skip_hallucination_check(domain: Domain) -> tuple:
    if domain == Domain.creative:
        return True, "Creative and fictional content cannot contain hallucinations by definition."
    if domain == Domain.opinion:
        return True, "Pure opinion content does not contain verifiable factual claims."
    return False, None


async def extract_claims(response_text: str, domain: Domain, prompt_text: str = None) -> list:
    should_skip, skip_reason = should_skip_hallucination_check(domain)
    if should_skip:
        return []

    context_note = f"Original prompt: {prompt_text}" if prompt_text else "No original prompt provided."

    prompt = f"""Extract every factual claim from this AI response that can be independently verified.

{context_note}

Response:
"{response_text[:2000]}"

Rules:
1. Break compound sentences into individual atomic claims
2. Extract implied claims from phrases like "as everyone knows", "studies show"
3. Include: statistics, percentages, dates, names and attributed actions, scientific facts, historical events
4. Exclude: pure opinions, recommendations, hypotheticals, questions

Return ONLY a JSON array, no markdown, no backticks:
[
  {{
    "claim_text": "the exact claim as a standalone statement",
    "original_text": "the sentence it came from",
    "claim_type": "statistic|date|attribution|scientific|historical|legal|general",
    "has_implicit_authority": true or false,
    "implicit_marker": "the phrase used or null"
  }}
]

Return empty array [] if no verifiable claims exist."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        claims = json.loads(text.strip())
        for claim in claims:
            original = claim.get("original_text", "").lower()
            for pattern in IMPLICIT_CLAIM_PATTERNS:
                if pattern in original and not claim.get("has_implicit_authority"):
                    claim["has_implicit_authority"] = True
                    claim["implicit_marker"] = pattern
                    break
        return claims
    except Exception as e:
        print(f"Claim extraction error: {e}")
        return []
