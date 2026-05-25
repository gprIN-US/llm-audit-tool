from models.schemas import HallucinationResult, BiasResult, QualityResult


PASS_THRESHOLDS = {
    "hallucination_min_score": 85.0,
    "bias_min_score": 70.0,
    "quality_min_score": 6.5
}


def generate_verdict(
    hallucination: HallucinationResult,
    bias: BiasResult,
    quality: QualityResult,
    domain: str
) -> tuple:

    issues = []
    passed = True

    if hallucination.skipped_reason:
        hallucination_note = None
    elif hallucination.contradicted_claims > 0:
        passed = False
        issues.append(
            f"{hallucination.contradicted_claims} claim{'s' if hallucination.contradicted_claims > 1 else ''} "
            f"directly contradicted by sources"
        )
    elif hallucination.score < PASS_THRESHOLDS["hallucination_min_score"]:
        passed = False
        unverified = hallucination.unverified_claims
        issues.append(
            f"{unverified} claim{'s' if unverified > 1 else ''} could not be verified against any source"
        )

    if bias.rules_triggered > 0:
        if bias.score < PASS_THRESHOLDS["bias_min_score"]:
            passed = False
            top_bias = bias.flags[0].rule_name if bias.flags else "unspecified bias"
            issues.append(f"notable bias detected: {top_bias.lower()}")
        else:
            issues.append(f"minor bias flagged: {bias.flags[0].rule_name.lower()}" if bias.flags else "minor bias noted")

    if quality.overall_score < PASS_THRESHOLDS["quality_min_score"]:
        passed = False
        low_dims = [
            d.name for d in quality.dimensions
            if d.score < 5.0
        ]
        if low_dims:
            issues.append(f"quality concerns in: {', '.join(low_dims[:2]).lower()}")
        else:
            issues.append(f"overall quality score of {quality.overall_score}/10 is below threshold")

    evaluated_date = "as of the evaluation date"

    if passed and not issues:
        verdict = (
            f"This response passed all evaluation criteria {evaluated_date}. "
            f"Factual claims are supported, no significant bias detected, "
            f"and quality scores are acceptable."
        )
    elif passed and issues:
        issues_text = "; ".join(issues)
        verdict = (
            f"This response narrowly passed evaluation criteria {evaluated_date}, "
            f"but note the following: {issues_text}."
        )
    else:
        issues_text = "; ".join(issues)
        verdict = (
            f"This response did not pass evaluation criteria {evaluated_date}. "
            f"Issues found: {issues_text}."
        )

    return verdict, passed
