import os
import json
import asyncio
import google.generativeai as genai
from exa_py import Exa
from models.schemas import HallucinationResult, Claim, Domain
from services.claim_extractor import extract_claims, should_skip_hallucination_check

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")
exa_client = Exa(api_key=os.getenv("EXA_API_KEY"))


SOURCE_TIERS = {
    1: [
        "pubmed.ncbi.nlm.nih.gov", "who.int", "cdc.gov", "nih.gov",
        "fda.gov", "nature.com", "science.org", "nejm.org",
        ".gov", ".edu"
    ],
    2: [
        "reuters.com", "apnews.com", "bbc.com", "nytimes.com",
        "theguardian.com", "wsj.com", "economist.com", "bloomberg.com",
        "scientificamerican.com", "nationalgeographic.com"
    ],
    3: [
        "wikipedia.org", "britannica.com", "investopedia.com",
        "mayoclinic.org", "webmd.com", "healthline.com"
    ]
}


def get_source_tier(url: str) -> int:
    url_lower = url.lower()
    for tier, domains in SOURCE_TIERS.items():
        for domain in domains:
            if domain in url_lower:
                return tier
    return 4


async def verify_single_claim(claim: dict) -> Claim:
    claim_text = claim.get("claim_text", "")
    has_implicit = claim.get("has_implicit_authority", False)

    if has_implicit and claim.get("implicit_marker") in ["studies show", "research indicates", "experts say"]:
        return Claim(
            text=claim_text,
            verdict="unverifiable",
            confidence=0.85,
            source_url=None,
            source_title="No specific source cited in original response",
            source_tier=None
        )

    search_prompt = f"""Convert this factual claim into the best 6-word search query to verify it:
Claim: "{claim_text}"
Return ONLY the search query, nothing else."""

    try:
        query_result = model.generate_content(search_prompt)
        search_query = query_result.text.strip().replace('"', '')
    except Exception:
        search_query = claim_text[:60]

    sources = []
    try:
        search_results = exa_client.search_and_contents(
            search_query,
            num_results=3,
            use_autoprompt=True,
            text={"max_characters": 500}
        )
        sources = search_results.results
    except Exception:
        return Claim(
            text=claim_text,
            verdict="unverifiable",
            confidence=0.5,
            source_url=None,
            source_title="Fact checking source temporarily unreachable",
            source_tier=None
        )

    if not sources:
        return Claim(
            text=claim_text,
            verdict="unverifiable",
            confidence=0.7,
            source_url=None,
            source_title="No sources found to verify this claim",
            source_tier=None
        )

    best_source = sources[0]
    source_tier = get_source_tier(best_source.url)

    source_texts = []
    for s in sources[:2]:
        text = getattr(s, 'text', '') or ''
        source_texts.append(f"Source ({s.url}):\n{text[:300]}")

    verification_prompt = f"""You are a fact checker. Determine if the claim is verified, contradicted, or unverifiable based on the sources.

Claim: "{claim_text}"

Sources:
{chr(10).join(source_texts)}

Return ONLY a JSON object, no markdown:
{{
  "verdict": "verified" or "contradicted" or "unverifiable",
  "confidence": 0.0 to 1.0,
  "reasoning": "one sentence explanation",
  "best_source_url": "url of most relevant source",
  "best_source_title": "title or domain name",
  "conflicting_source": "url if two sources disagree, otherwise null"
}}

Rules:
- Only use "contradicted" if a source EXPLICITLY states something different
- Use "unverifiable" if sources are present but do not directly address the claim
- confidence must reflect genuine uncertainty, not just echo the verdict
- Never give contradicted verdict with confidence below 0.75"""

    try:
        verify_result = model.generate_content(verification_prompt)
        text = verify_result.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        verdict_data = json.loads(text.strip())

        if verdict_data.get("verdict") == "contradicted" and verdict_data.get("confidence", 0) < 0.75:
            verdict_data["verdict"] = "unverifiable"

        return Claim(
            text=claim_text,
            verdict=verdict_data.get("verdict", "unverifiable"),
            confidence=verdict_data.get("confidence", 0.6),
            source_url=verdict_data.get("best_source_url", best_source.url),
            source_title=verdict_data.get("best_source_title", best_source.url),
            source_tier=source_tier,
            conflicting_source=verdict_data.get("conflicting_source")
        )
    except Exception:
        return Claim(
            text=claim_text,
            verdict="unverifiable",
            confidence=0.5,
            source_url=best_source.url,
            source_title=best_source.url,
            source_tier=source_tier
        )


async def run_hallucination_check(
    response_text: str,
    domain: Domain,
    prompt_text: str = None
) -> HallucinationResult:

    should_skip, skip_reason = should_skip_hallucination_check(domain)
    if should_skip:
        return HallucinationResult(
            score=100.0,
            total_claims=0,
            verified_claims=0,
            unverified_claims=0,
            contradicted_claims=0,
            claims=[],
            skipped_reason=skip_reason
        )

    raw_claims = await extract_claims(response_text, domain, prompt_text)

    if not raw_claims:
        return HallucinationResult(
            score=100.0,
            total_claims=0,
            verified_claims=0,
            unverified_claims=0,
            contradicted_claims=0,
            claims=[],
            skipped_reason="No verifiable factual claims found in this response."
        )

    tasks = [verify_single_claim(claim) for claim in raw_claims[:10]]
    verified_claims = await asyncio.gather(*tasks)

    total = len(verified_claims)
    verified = sum(1 for c in verified_claims if c.verdict == "verified")
    contradicted = sum(1 for c in verified_claims if c.verdict == "contradicted")
    unverified = total - verified - contradicted

    if total == 0:
        score = 100.0
    else:
        score = round((verified / total) * 100, 1)

    return HallucinationResult(
        score=score,
        total_claims=total,
        verified_claims=verified,
        unverified_claims=unverified,
        contradicted_claims=contradicted,
        claims=list(verified_claims)
    )
