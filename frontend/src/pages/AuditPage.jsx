import { useState } from "react"
import ScoreCard from "../components/ScoreCard"
import ClaimsList from "../components/ClaimsList"
import BiasFlagsList from "../components/BiasFlagsList"
import QualityDimensions from "../components/QualityDimensions"
import ProgressTracker from "../components/ProgressTracker"
import VerdictBanner from "../components/VerdictBanner"
import ContextInference from "../components/ContextInference"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

const EXAMPLE_HALLUCINATION = {
  prompt: "What is the success rate of appendectomy surgery?",
  response: "Appendectomy is one of the most common surgical procedures worldwide. Studies show it has a 99.8% success rate with virtually no complications. The procedure was first performed in 1735 by Claudius Amyand in London. Recovery typically takes 2 to 4 weeks for open surgery and just 3 days for laparoscopic approaches. Research indicates that complications occur in less than 0.1% of all cases globally."
}

export default function AuditPage() {
  const [responseText, setResponseText] = useState("")
  const [promptText, setPromptText] = useState("")
  const [modelName, setModelName] = useState("")
  const [viewMode, setViewMode] = useState("simple")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const loadExample = () => {
    setPromptText(EXAMPLE_HALLUCINATION.prompt)
    setResponseText(EXAMPLE_HALLUCINATION.response)
    setResult(null)
    setError(null)
  }

  const runAudit = async () => {
    if (!responseText.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    setProgress([])

    const steps = [
      { label: "Detecting domain and language...", delay: 0 },
      { label: "Extracting factual claims...", delay: 1200 },
      { label: "Verifying claims against sources...", delay: 2400 },
      { label: "Running bias analysis across 13 rules...", delay: 4000 },
      { label: "Scoring quality across 10 dimensions...", delay: 5200 },
      { label: "Generating final verdict...", delay: 6400 }
    ]

    steps.forEach(step => {
      setTimeout(() => {
        setProgress(prev => [...prev, step.label])
      }, step.delay)
    })

    try {
      const response = await fetch(`${API_BASE}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response_text: responseText,
          prompt_text: promptText || null,
          model_name: modelName || null
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.detail || "Evaluation failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    if (!result) return
    navigator.clipboard.writeText(`${window.location.origin}${result.share_url}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          fontWeight: 700,
          marginBottom: "0.5rem",
          lineHeight: 1.2
        }}>
          Paste any AI response.<br />
          <span style={{ color: "var(--accent)" }}>Find out if it is lying, biased, or low quality.</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          40 evaluation rules. Factual grounding. Multi-judge panel. Real sources cited.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div>
          <label>Original Prompt (optional but recommended)</label>
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            placeholder="What question or instruction generated the AI response?"
            style={{ height: "80px" }}
          />
        </div>
        <div>
          <label>Model Name (optional)</label>
          <input
            value={modelName}
            onChange={e => setModelName(e.target.value)}
            placeholder="e.g. GPT-4o, Gemini, Claude..."
          />
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>AI Response to Audit</label>
        <textarea
          value={responseText}
          onChange={e => setResponseText(e.target.value)}
          placeholder="Paste the AI response you want to evaluate here..."
          style={{ height: "180px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "2rem" }}>
        <button
          className="btn-primary"
          onClick={runAudit}
          disabled={loading || !responseText.trim()}
        >
          {loading ? "Evaluating..." : "Run Audit"}
        </button>
        <button className="btn-ghost" onClick={loadExample}>
          Try an example
        </button>
        {result && (
          <>
            <button className="btn-ghost" onClick={copyShareLink}>
              {copied ? "Copied!" : "Share result"}
            </button>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
              {["simple", "detailed"].map(mode => (
                <button
                  key={mode}
                  className="btn-ghost"
                  onClick={() => setViewMode(mode)}
                  style={{
                    borderColor: viewMode === mode ? "var(--accent)" : undefined,
                    color: viewMode === mode ? "var(--accent)" : undefined
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {loading && <ProgressTracker steps={progress} />}

      {error && (
        <div style={{
          background: "var(--red-dim)",
          border: "1px solid var(--red)",
          borderRadius: "var(--radius-sm)",
          padding: "1rem",
          color: "var(--red)",
          marginBottom: "1.5rem"
        }}>
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="animate-in">
          {result.context_mode === "inferred" && result.inferred_prompts?.length > 0 && (
            <ContextInference
              prompts={result.inferred_prompts}
              domain={result.domain}
            />
          )}

          <VerdictBanner
            passed={result.overall_passed}
            verdict={result.overall_verdict}
            domain={result.domain}
            contextMode={result.context_mode}
            rulesetVersion={result.ruleset_version}
          />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            margin: "1.5rem 0"
          }}>
            <ScoreCard
              title="Hallucination Score"
              score={result.hallucination.score}
              subtitle={
                result.hallucination.skipped_reason
                  ? result.hallucination.skipped_reason
                  : `${result.hallucination.verified_claims} verified, ${result.hallucination.contradicted_claims} contradicted`
              }
              type="hallucination"
            />
            <ScoreCard
              title="Bias Score"
              score={result.bias.score}
              subtitle={`${result.bias.rules_triggered} of ${result.bias.total_rules_checked} rules triggered`}
              type="bias"
            />
            <ScoreCard
              title="Quality Score"
              score={result.quality.overall_score}
              subtitle={`Across ${result.quality.dimensions.length} dimensions`}
              type="quality"
              maxScore={10}
            />
          </div>

          {viewMode === "detailed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <ClaimsList claims={result.hallucination.claims} />
              <BiasFlagsList flags={result.bias.flags} />
              <QualityDimensions dimensions={result.quality.dimensions} />

              <div className="card">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", marginBottom: "1rem", color: "var(--text-muted)" }}>
                  JUDGE PANEL
                </h3>
                {result.judge_panel.map((judge, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.85rem"
                  }}>
                    <span style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                      {judge.judge_model}
                    </span>
                    <span style={{ color: "var(--text-muted)" }}>
                      Halluc: {judge.hallucination_score}% | Bias: {judge.bias_score}% | Quality: {judge.quality_score}/10
                    </span>
                  </div>
                ))}
              </div>

              <div className="card" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                  <span>Evaluation ID: <code style={{ color: "var(--accent)" }}>{result.evaluation_id}</code></span>
                  <span>Ruleset: <code style={{ color: "var(--accent)" }}>{result.ruleset_version}</code></span>
                  <span>Domain: <code style={{ color: "var(--accent)" }}>{result.domain}</code></span>
                  <span>Context: <code style={{ color: "var(--accent)" }}>{result.context_mode}</code></span>
                  <span>Evaluated: <code style={{ color: "var(--accent)" }}>{new Date(result.evaluated_at).toLocaleString()}</code></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
