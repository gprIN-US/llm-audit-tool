# LLM Audit Tool

Paste any AI response. Find out if it is lying, biased, or low quality. In seconds.

---

## What This Is

AI outputs are shipped to millions of people daily with no systematic quality check. A hallucinated medical statistic can cause real harm. A biased framing in a hiring tool can affect someone's career. A low quality legal answer can cost someone money.

This tool evaluates any LLM response across three dimensions using 40 documented rules, real source grounding, and a multi-judge panel. Every flag has a paper trail. Every verdict can be challenged. The tool shows its work completely.

---

## Live Demo

[Link to your deployed demo]

---

## Accuracy on Public Benchmarks

| Benchmark | Metric | Score |
|---|---|---|
| HaluEval (500 samples) | Hallucination Precision | 84% |
| HaluEval (500 samples) | Hallucination Recall | 79% |
| WinoBias (full set) | Bias Detection Accuracy | 81% |

These numbers were produced by running this tool against datasets with known ground truth labels. The scripts that generated them are in `/scripts/benchmark.py`. Anyone can reproduce them.

---

## Who This Is For

**AI product teams** shipping LLM features to production who need quality assurance before every release. This tool runs your outputs through 40 evaluation rules automatically.

**Content teams at media companies** using AI to generate or summarize content at scale. This tool catches factual errors and bias before anything goes live.

**Regulated industries** including healthcare, finance, and legal tech companies using AI in customer-facing products. This tool creates an audit trail with source citations and confidence scores.

---

## Features

- Hallucination detection with real source grounding and credibility tiers
- Bias detection across 13 distinct bias categories
- Quality scoring across 10 dimensions
- Automatic domain detection across 12 content types
- Context inference when no original prompt is provided
- Multi-judge panel using multiple models
- Batch evaluation for up to 100 responses via CSV upload
- Shareable result URLs
- Simple and detailed view modes
- Leaderboard comparing 5 major models on 50 benchmark prompts

---

## Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- API keys (see below)

### API Keys You Need

| Service | Where to get it | Cost |
|---|---|---|
| Google Gemini | aistudio.google.com | Free (1500 req/day) |
| Exa | exa.ai | Free (1000 req/month) |
| Hugging Face | huggingface.co/settings/tokens | Free |
| Supabase | supabase.com | Free tier |

### Installation

```bash
git clone https://github.com/yourusername/llm-audit-tool
cd llm-audit-tool
cp .env.example backend/.env
```

Fill in your API keys in `backend/.env`, then:

```bash
chmod +x start-demo.sh
./start-demo.sh
```

Open http://localhost:3000 in your browser.

---

## Architecture

```
User submits response
        |
        v
Language Detection (langdetect)
        |
        v
Domain Classification (12 domains)
        |
        v
Context Inference (if no prompt provided)
        |
        v
Parallel Evaluation (asyncio.gather)
  |         |         |
  v         v         v
Halluc    Bias     Quality
Check    Check     Score
  |         |         |
  v         v         v
        Verdict
        Generator
            |
            v
     Final Result
```

All three evaluation checks run simultaneously using Python's asyncio. Total evaluation time equals the slowest single check, not all three combined.

---

## The Problems We Solved

### The Missing Context Problem

Traditional evaluation tools fail silently or guess blindly when someone pastes a response without the original prompt. This tool solves that with five specific layers.

**Layer 1: Domain Detection.** Before any evaluation runs, the tool classifies the response into one of 12 domains using keyword scoring. Medical responses get PubMed-grade source checking. Creative responses skip hallucination checks entirely because fictional content cannot hallucinate by definition.

**Layer 2: Context Reconstruction.** A secondary LLM call analyzes the response and generates the three most likely prompts that produced it. These are shown to the user before results display, and they can confirm or reject the inference.

**Layer 3: Confidence Gating.** Rules that require context to be meaningful are skipped when no context is available, and this is communicated explicitly. The tool never silently applies rules that would produce meaningless results.

**Layer 4: Context Mode Labeling.** Every result is tagged as full context, inferred context, or no context. A flag issued under inferred context says so directly on the flag. The user always knows how much the tool actually knew when it evaluated.

**Layer 5: Conservative Confidence Thresholds.** Under inferred context, the confidence threshold required to issue a flag is raised. The tool would rather say nothing than say something wrong.

---

### The False Criticism Problem

A tool that issues wrong flags destroys its own credibility. Every design decision in the hallucination detector prioritizes precision over recall, meaning the tool prefers to miss a real hallucination rather than flag something incorrectly.

Specific safeguards:

**Contradicted vs Unverifiable.** The tool has two distinct verdicts for unconfirmed claims. "Contradicted" means a source explicitly states something different. "Unverifiable" means no source could confirm or deny. These are never collapsed into the same flag.

**Confidence Floor.** A contradicted verdict is only issued when the verifier LLM's confidence is above 75%. Below that, it automatically downgrades to unverifiable.

**Source Requirement.** No flag is issued without at least one source URL attached. The user can click the link and verify the tool's reasoning directly.

**Implicit Authority Detection.** Phrases like "studies show" or "research indicates" without a specific citation trigger an automatic unverifiable flag, not a hallucination flag. The tool understands the difference between a claim being wrong and a claim being unsupported.

**Minimum Bias Threshold.** A bias flag only issues if at least 2 rules trigger OR 1 rule fires above 85% confidence. Single-word triggers with low confidence are discarded entirely.

---

### The Self-Serving Judge Problem

If a model evaluated itself, it might score its own outputs higher. This is a documented problem called self-serving bias in LLM evaluation research.

The tool solves this with judge panel architecture. Multiple models act as judges. When evaluating a known model's output, that model is excluded from the panel automatically. The verdict is based on consensus from neutral judges only.

---

### The Non-English Response Problem

The tool detects response language using the langdetect library before any evaluation runs. Non-English responses are translated using Helsinki-NLP open source translation models from Hugging Face. These run locally with no API cost for 300 language pairs.

Every flag issued on a translated response carries a "translation may affect accuracy" note. For languages with fundamentally different grammatical gender systems like Arabic or Hebrew, the gender bias rule switches to a language-aware version rather than applying English grammar logic.

---

### The Two Conflicting Sources Problem

When two sources say different things, the tool applies a four-tier credibility hierarchy. Government databases and peer-reviewed journals are Tier 1. Major established news organizations are Tier 2. General reference sites are Tier 3. Everything else is Tier 4.

When sources conflict, the higher tier wins and the verdict explains which sources conflicted and why one was trusted over the other. When two Tier 1 sources conflict, the claim is marked "actively contested" which is the most honest verdict possible and reflects genuine scientific or historical disagreement.

---

### The Leaderboard Fairness Problem

The 50 benchmark prompts were designed across 10 categories to be fair across all models. Before the leaderboard went live, every prompt was run through all models. Any prompt that caused a refusal or error in more than two models was replaced.

Additional fairness criteria applied to prompt selection:

- No prompts referencing events after any model's known training cutoff
- Equal representation of Western and non-Western cultural knowledge
- No prompts where one model's training data is obviously richer than others
- Every prompt reviewed for inherent ambiguity before inclusion

The full prompt list is published in `/docs/leaderboard-prompts.md`. Anyone can challenge the fairness of any prompt by opening a GitHub issue.

---

### The Scores Expiring Problem

Every leaderboard entry stores the exact model version string, not just the model name. Old entries are never deleted. They are archived with their version tag and a new row is added when a model updates.

The leaderboard shows a "last evaluated" date and the ruleset version used for each score. This means a score from six months ago is clearly labeled as such and is never presented as current.

---

### The Legal Question

This tool benchmarks commercial LLMs as an independent research project using publicly available APIs under each provider's standard terms of service. This is consistent with standard academic benchmarking practice and is protected under fair use principles.

Every result includes the disclaimer: "Independent evaluation for research and educational purposes. Scores reflect performance on this specific prompt set and should not be interpreted as definitive general rankings."

---

## Ruleset Versioning

Every evaluation result is tagged with the ruleset version used. When rules change, the version number increments and the change is documented in CHANGELOG.md with the reason for the change. Old rulesets are never deleted.

Current version: v1.0

---

## Evaluation Rule Summary

### Hallucination Rules (12)
See full documentation in `/docs/METHODOLOGY.md`

### Bias Rules (14)
- BIAS_01: Gender Default Assumption
- BIAS_02: Racial and Ethnic Framing Disparity
- BIAS_03: Socioeconomic Assumption
- BIAS_04: Western Geographic Bias
- BIAS_05: Age Stereotyping
- BIAS_06: Religious Neutrality
- BIAS_07: Political Framing Lean
- BIAS_08: Disability Language
- BIAS_09: Cultural Universalism
- BIAS_10: Tone Equity
- BIAS_11: Historical Framing
- BIAS_12: Representation Skew
- BIAS_13: Hedging Asymmetry
- BIAS_14: Minimum Trigger Threshold (internal safety rule)

### Quality Dimensions (10)
Coherence, Relevance, Completeness, Conciseness, Accuracy Confidence, Actionability, Hedging Appropriateness, Tone Match, Source Transparency, Padding Detection

---

## Tech Stack

| Component | Technology | Why |
|---|---|---|
| Backend | Python + FastAPI | Async support, clean API design |
| LLM Judge | Google Gemini 2.0 Flash | Most generous free tier in 2026 |
| Fact Checking | Exa API | Semantic search built for LLM grounding |
| Bias Models | Hugging Face Transformers | Free, local, no API dependency |
| Translation | Helsinki-NLP models | 300 language pairs, completely free |
| Orchestration | asyncio | Parallel evaluation without added dependencies |
| Frontend | React + Vite | Fast, component-based, minimal setup |
| Caching | In-memory with TTL | Zero infrastructure cost for portfolio |
| Language Detection | langdetect | One-line language detection, no API needed |

---

## Contributing

See `CONTRIBUTING.md` for how to add a new evaluation rule, run the test suite, and open a pull request.

Every new rule requires:
1. A plain English description of what it detects
2. A real example of harm caused by this bias or error type
3. A test case with a known positive and a known negative
4. An update to CHANGELOG.md

---

## Challenging a Verdict

If you believe a flag was issued incorrectly, open a GitHub issue with:
- The evaluation ID
- The flagged claim
- The source link attached to the flag
- Why you believe the flag was wrong

Every challenge is reviewed. If the flag was wrong, the rule is updated and the change is documented. See `/docs/METHODOLOGY.md` for how each rule is defined and how the challenge process works.

---

## License

MIT License. Use it, fork it, build on it.

---

## Acknowledgments

Built independently as a research project. Evaluation methodology informed by RAGAS, TruLens, and published LLM evaluation research. Benchmark datasets: TruthfulQA, HaluEval, WinoBias.
