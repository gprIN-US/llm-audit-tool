import os
import json
import google.generativeai as genai
from models.schemas import Domain

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")


DOMAIN_KEYWORDS = {
    Domain.medical: [
        "patient", "diagnosis", "treatment", "surgery", "medication",
        "doctor", "hospital", "symptom", "disease", "clinical",
        "therapy", "prescription", "dose", "health", "medical"
    ],
    Domain.legal: [
        "law", "legal", "court", "judge", "attorney", "lawsuit",
        "regulation", "statute", "contract", "liability", "jurisdiction",
        "plaintiff", "defendant", "ruling", "legislation"
    ],
    Domain.financial: [
        "investment", "stock", "market", "revenue", "profit", "loss",
        "interest rate", "portfolio", "asset", "equity", "dividend",
        "bond", "fund", "tax", "accounting"
    ],
    Domain.scientific: [
        "research", "study", "experiment", "hypothesis", "data",
        "evidence", "molecule", "atom", "gene", "protein",
        "quantum", "physics", "chemistry", "biology", "science"
    ],
    Domain.historical: [
        "century", "war", "empire", "revolution", "ancient",
        "medieval", "dynasty", "civilization", "historical", "history",
        "decade", "era", "period", "timeline", "event"
    ],
    Domain.technical: [
        "code", "function", "algorithm", "database", "server",
        "api", "framework", "programming", "software", "hardware",
        "network", "protocol", "memory", "compute", "deploy"
    ],
    Domain.political: [
        "government", "policy", "election", "party", "democracy",
        "president", "senator", "congress", "parliament", "vote",
        "political", "legislation", "cabinet", "administration"
    ],
    Domain.creative: [
        "story", "fiction", "character", "plot", "novel",
        "poem", "fantasy", "imagine", "narrative", "creative",
        "tale", "dragon", "magic", "invented", "fictional"
    ],
    Domain.opinion: [
        "think", "believe", "opinion", "perspective", "view",
        "feel", "suggest", "recommend", "prefer", "consider",
        "personally", "in my opinion", "i would", "best option"
    ]
}


def detect_domain_fast(response_text: str) -> Domain:
    text_lower = response_text.lower()
    scores = {}

    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        scores[domain] = score

    best_domain = max(scores, key=scores.get)
    if scores[best_domain] == 0:
        return Domain.general

    return best_domain


async def detect_domain_and_infer_context(response_text: str) -> dict:
    fast_domain = detect_domain_fast(response_text)

    prompt = f"""Analyze this AI response and return ONLY a JSON object with no markdown, no backticks, just raw JSON.

Response to analyze:
"{response_text[:1500]}"

Return this exact structure:
{{
  "domain": "one of: medical, legal, financial, scientific, historical, technical, political, cultural, educational, creative, opinion, general",
  "inferred_prompts": [
    "most likely question that generated this response",
    "second most likely question",
    "third most likely question"
  ],
  "domain_confidence": 0.0 to 1.0
}}

Rules:
- domain must be exactly one of the listed values
- inferred_prompts must be 3 realistic questions
- For creative/fictional content, use domain: creative
- For pure opinions without facts, use domain: opinion"""

    try:
        result = model.generate_content(prompt)
        text = result.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        parsed = json.loads(text.strip())
        return {
            "domain": parsed.get("domain", fast_domain.value),
            "inferred_prompts": parsed.get("inferred_prompts", []),
            "domain_confidence": parsed.get("domain_confidence", 0.7)
        }
    except Exception:
        return {
            "domain": fast_domain.value,
            "inferred_prompts": [],
            "domain_confidence": 0.5
        }
