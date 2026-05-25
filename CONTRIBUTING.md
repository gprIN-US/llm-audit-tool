# Contributing to LLM Audit Tool

Thank you for wanting to improve this project. Here is exactly how to do it.

---

## How to Add a New Evaluation Rule

Bias rules live in `backend/services/bias_detector.py` inside the `BIAS_RULES` list.

Each rule follows this structure:

```python
{
    "id": "BIAS_15",
    "name": "Your Rule Name",
    "description": "One sentence describing exactly what this rule detects",
    "skip_domains": [Domain.creative, Domain.opinion]  # domains where rule does not apply
}
```

After adding the rule to the list, add a test case in `backend/tests/test_bias.py` with one known positive example (text that should trigger the rule) and one known negative example (text that should not).

Hallucination rules are defined in the prompt inside `backend/services/claim_extractor.py`. To modify extraction behavior, edit the prompt and add a test case in `backend/tests/test_hallucination.py`.

Quality dimensions live in `backend/services/quality_scorer.py` inside `QUALITY_DIMENSIONS`.

---

## How to Run Tests Locally

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m pytest tests/ -v
```

---

## How to Run Benchmark Accuracy Tests

```bash
cd backend
source venv/bin/activate
python scripts/benchmark.py
```

This will output precision and recall numbers against the HaluEval and WinoBias datasets. Results are saved to `benchmark_results.json`.

---

## What a Good Pull Request Looks Like

Every pull request must include:

1. The rule addition or modification in the relevant service file
2. A plain English description of what the rule detects and why it matters
3. At least one test case with a known positive and known negative
4. An update to `CHANGELOG.md` describing what changed and why
5. If you are adding a bias rule, include a real-world example of harm caused by the bias pattern

Pull requests that add rules without test cases will not be merged. The tool's credibility depends on not shipping rules that generate false positives.

---

## Code Style

- Python: PEP8, no lines over 100 characters
- React: functional components, no class components
- No `em` dashes anywhere in code or documentation
- All user-facing text written in plain language, no jargon without explanation
