import os
import json
from google import genai
from google.genai import types
from models.schemas import Domain

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

DOMAIN_KEYWORDS = {
    Domain.medical: ["patient", "diagnosis", "treatment", "surgery", "medication", "doctor", "hospital", "symptom", "disease", "clinical", "therapy", "prescription", "dose", "health", "medical"],
    Domain.legal: ["law", "legal", "court", "judge", "attorney", "lawsuit", "regulation", "statute", "contract", "liability", "jurisdiction", "plaintiff", "defendant", "ruling", "legislation"],
    Domain.financial: ["investment", "stock", "market", "revenue", "profit", "loss", "interest rate", "portfolio", "asset", "equity", "dividend", "bond", "fund", "tax", "accounting"],
    Domain.scientific: ["research", "study", "experiment", "hypothesis", "data", "evidence", "molecule", "atom", "gene", "protein", "quantum", "physics", "chemistry", "biology", "science"],
    Domain.historical: ["century", "war", "empire", "revolution", "ancient", "medieval", "dynasty", "civilization", "historical", "history", "decade", "era", "period", "timeline", "event"],
    Domain.technical: ["code", "function", "algorithm", "database", "server", "api", "framework", "programming", "software", "hardware", "network", "protocol", "memory", "compute", "deploy"],
    Domain.political: ["government", "policy", "election", "party", "democracy", "president", "senator", "congress", "parliament", "vote", "political", "legislation", "cabinet", "administration"],
    Domain.creative: ["story", "fiction", "character", "plot", "novel", "poem", "fantasy", "imagine", "narrative", "creative", "tale", "dragon", "magic", "invented", "fictional"],
    Domain.opinion: ["think", "believe", "opinion", "perspective", "view", "feel", "suggest", "recommend", "prefer", "consider", "personally", "in my opinion", "i would", "best option"]
}


def detect_domain_fast(response_text: str) -> Domain:
    text_lower = response_text.lower()
    scores = {domain: sum(1 for kw in keywords if kw in text_lower) for domain, keywords in DOMAIN_KEYWORDS.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else Domain.general


async def detect_domain_and_infer_context(response_text: str) -> dict:
    fast_domain = detect_domain_fast(response_text)

    prompt = f"""Analyze this AI response and return ONLY a JSON object with no markdown, no backticks, just raw JSON.

Response to analyze:
"{response_text[:1500]}"

Return this exact structure:
{{
  "domain": "one of: medical, legal, financial, scientific, historical, technical, political, cultural, educational, creative, opinion, general",
  "inferred_prompts": ["most likely question", "second most likely", "third most likely"],
  "domain_confidence": 0.0
}}"""

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
        parsed = json.loads(text.strip())
        return {
            "domain": parsed.get("domain", fast_domain.value),
            "inferred_prompts": parsed.get("inferred_prompts", []),
            "domain_confidence": parsed.get("domain_confidence", 0.7)
        }
    except Exception as e:
        return {"domain": fast_domain.value, "inferred_prompts": [], "domain_confidence": 0.5}
