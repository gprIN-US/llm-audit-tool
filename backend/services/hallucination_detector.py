import os
import json
import asyncio
from google import genai
from exa_py import Exa
from models.schemas import HallucinationResult, Claim, Domain
from services.claim_extractor import extract_claims, should_skip_hallucination_check

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
exa_client = Exa(api_key=os.getenv("EXA_API_KEY"))

SOURCE_TIERS = {
    1: ["pubmed.ncbi.nlm.nih.gov", "who.int", "cdc.gov", "nih.gov", "fda.gov", "nature.com", "science.org", ".gov", ".edu"],
    2: ["reuters.com", "apnews.com", "bbc.com", "nytimes.com", "theguardian.com", "wsj.com", "economist.com", "bloomberg.com"],
    3: ["wikipedia.org", "britannica.com", "investopedia.com", "mayoclinic.org", "webmd.com"]
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

    if claim.get("has_implicit_authority") and claim.get("implicit_marker") in ["studies show", "research indicates", "experts say"]:
        return Claim(text=claim_text, verdict="unverifiable", confidence=0.85, source_title="No specific source cited")

    try:
        query_response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f'Convert this claim into a 6-word search query: "{claim_text}"\nReturn ONLY the search query.'
        )
        search_query = query_response.text.strip().replace('"', '')
    except Exception:
        search_query = claim_text[:60]

    try:
        search_results = exa_client.search_and_contents(search_query, num_results=3, use_autoprompt=True, text={"max_characters": 500})
        sources = search_results.results
    except Exception:
        return Claim(text=claim_text, verdict="unverifiable", confidence=0.5, source_title="Fact checking source temporarily unreachable")

    if not sources:
        return Claim(text=claim_text, verdict="unverifiable", confidence=0.7, source_title="No sources found")

    best_source = sources[0]
    source_tier = get_source_tier(best_source.url)
    source_texts = [f"Source ({s.url}):\n{(getattr(s, 'text', '') or '')[:300]}" for s in sources[:2]]

    try:
        verify_response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"""Fact check this claim against the sources.

Claim: "{claim_text}"

Sources:
{chr(10).join(source_texts)}

Return ONLY JSON, no markdown:
{{
  "verdict": "verified" or "contradicted" or "unverifiable",
  "confidence": 0.0 to 1.0,
  "best_source_url": "url",
  "best_source_title": "title",
  "conflicting_source": null
}}

Only use "contradicted" if source EXPLICITLY states something different with confidence above 0.75."""
        )
        text = verify_response.text.strip()
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
    except Exception as e:
        print(f"Verify error: {e}")
        return Claim(text=claim_text, verdict="unverifiable", confidence=0.5, source_url=best_source.url, source_tier=source_tier)


async def run_hallucination_check(response_text: str, domain: Domain, prompt_text: str = None) -> HallucinationResult:
    should_skip, skip_reason = should_skip_hallucination_check(domain)
    if should_skip:
        return HallucinationResult(score=100.0, total_claims=0, verified_claims=0, unverified_claims=0, contradicted_claims=0, claims=[], skipped_reason=skip_reason)

    raw_claims = await extract_claims(response_text, domain, prompt_text)
    if not raw_claims:
        return HallucinationResult(score=100.0, total_claims=0, verified_claims=0, unverified_claims=0, contradicted_claims=0, claims=[], skipped_reason="No verifiable factual claims found.")

    tasks = [verify_single_claim(claim) for claim in raw_claims[:10]]
    verified_claims = await asyncio.gather(*tasks)

    total = len(verified_claims)
    verified = sum(1 for c in verified_claims if c.verdict == "verified")
    contradicted = sum(1 for c in verified_claims if c.verdict == "contradicted")
    unverified = total - verified - contradicted
    score = round((verified / total) * 100, 1) if total > 0 else 100.0

    return HallucinationResult(score=score, total_claims=total, verified_claims=verified, unverified_claims=unverified, contradicted_claims=contradicted, claims=list(verified_claims))
