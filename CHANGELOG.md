# Changelog

All rule changes are documented here. Scores on the leaderboard reference the ruleset version used when they were calculated.

---

## v1.0 (2026-05-25)

Initial release.

### Hallucination Detection
- 12 rules implemented
- Contradicted vs Unverifiable distinction
- Confidence floor at 75% for contradicted verdicts
- Source credibility tiers 1 through 4
- Implicit authority phrase detection
- Creative and opinion domain bypass

### Bias Detection
- 13 active detection rules (BIAS_01 through BIAS_13)
- BIAS_14 minimum trigger threshold safety rule
- Domain-specific rule skipping for creative and opinion content

### Quality Scoring
- 10 dimensions with weighted averaging
- Automatic filler phrase detection
- Context-dependent dimensions skipped when no prompt provided

### Infrastructure
- Domain detection across 12 content types
- Context inference with 3 inferred prompt suggestions
- Language detection and translation for non-English responses
- In-memory caching with 24-hour TTL
- Shareable result URLs
- Batch evaluation up to 100 responses
