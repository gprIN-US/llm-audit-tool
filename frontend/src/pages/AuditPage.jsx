import { useState } from "react"
import ScoreCard from "../components/ScoreCard"
import ClaimsList from "../components/ClaimsList"
import BiasFlagsList from "../components/BiasFlagsList"
import QualityDimensions from "../components/QualityDimensions"
import VerdictBanner from "../components/VerdictBanner"
import ContextInference from "../components/ContextInference"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

const EXAMPLE = {
  prompt: "What is the success rate of appendectomy surgery?",
  response: "Appendectomy is one of the most common surgical procedures worldwide. Studies show it has a 99.8% success rate with virtually no complications. The procedure was first performed in 1735 by Claudius Amyand in London. Recovery typically takes 2 to 4 weeks for open surgery and just 3 days for laparoscopic approaches. Research indicates that complications occur in less than 0.1% of all cases globally."
}

const STEPS = [
  "Detecting domain and language",
  "Extracting factual claims",
  "Verifying claims against sources",
  "Running bias analysis",
  "Scoring quality",
  "Generating verdict",
]

export default function AuditPage() {
  const [response, setResponse] = useState("")
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("")
  const [view, setView] = useState("simple")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const runAudit = async () => {
    if (!response.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    setStep(0)

    STEPS.forEach((_, i) => {
      setTimeout(() => setStep(i), i * 1100)
    })

    try {
      const res = await fetch(`${API_BASE}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response_text: response,
          prompt_text: prompt || null,
          model_name: model || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Evaluation failed. Please try again.")
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const share = () => {
    navigator.clipboard.writeText(window.location.origin + (result?.share_url || ""))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          fontWeight: 400,
          lineHeight: 1.25,
          marginBottom: 10,
          color: "var(--text)",
        }}>
          Paste any AI response.<br />
          Find out if it is accurate.
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6 }}>
          40 rules. Real source grounding. Every flag has a paper trail.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label>Original prompt</label>
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="What question generated this response?"
            />
          </div>
          <div>
            <label>Model name</label>
            <input
              value={model}
              onChange={e => setModel(e.target.value)}
              placeholder="GPT-4o, Gemini, Claude..."
            />
          </div>
        </div>

        <div>
          <label>AI response to audit</label>
          <textarea
            value={response}
            onChange={e => setResponse(e.target.value)}
            placeholder="Paste the AI response here..."
            style={{ height: 160 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="btn-primary"
            onClick={runAudit}
            disabled={loading || !response.trim()}
          >
            {loading ? "Evaluating..." : "Run audit"}
          </button>
          <button
            className="btn-secondary"
            onClick={() => { setPrompt(EXAMPLE.prompt); setResponse(EXAMPLE.response); setResult(null) }}
          >
            Try an example
          </button>
          {result && (
            <>
              <button className="btn-ghost" onClick={share}>
                {copied ? "Copied link" : "Share"}
              </button>
              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                <button className={`btn-ghost ${view === "simple" ? "active" : ""}`} onClick={() => setView("simple")}>Simple</button>
                <button className={`btn-ghost ${view === "detailed" ? "active" : ""}`} onClick={() => setView("detailed")}>Detailed</button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ marginTop: 32, padding: "20px 24px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div className="pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--text)" }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>Evaluating</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                fontSize: 13,
                color: i === step ? "var(--text)" : i < step ? "var(--text-dim)" : "var(--text-dim)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ width: 14, textAlign: "center", fontSize: 11 }}>
                  {i < step ? "✓" : i === step ? "→" : ""}
                </span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 24,
          padding: "14px 16px",
          background: "var(--red-bg)",
          border: "1px solid var(--red-border)",
          borderRadius: "var(--radius-sm)",
          color: "var(--red)",
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="animate-in" style={{ marginTop: 32 }}>
          {result.context_mode === "inferred" && result.inferred_prompts?.length > 0 && (
            <ContextInference prompts={result.inferred_prompts} domain={result.domain} />
          )}

          <VerdictBanner passed={result.overall_passed} verdict={result.overall_verdict} domain={result.domain} contextMode={result.context_mode} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "16px 0" }}>
            <ScoreCard title="Hallucination" score={result.hallucination.score} subtitle={result.hallucination.skipped_reason || `${result.hallucination.verified_claims} verified, ${result.hallucination.contradicted_claims} contradicted`} type="pct" />
            <ScoreCard title="Bias" score={result.bias.score} subtitle={`${result.bias.rules_triggered} of ${result.bias.total_rules_checked} rules triggered`} type="pct" />
            <ScoreCard title="Quality" score={result.quality.overall_score} subtitle={`${result.quality.dimensions.length} dimensions scored`} type="ten" />
          </div>

          {view === "detailed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ClaimsList claims={result.hallucination.claims} />
              <BiasFlagsList flags={result.bias.flags} />
              <QualityDimensions dimensions={result.quality.dimensions} />

              <div className="card" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    ["ID", result.evaluation_id],
                    ["Ruleset", result.ruleset_version],
                    ["Domain", result.domain],
                    ["Context", result.context_mode],
                    ["Evaluated", new Date(result.evaluated_at).toLocaleString()],
                  ].map(([k, v]) => (
                    <span key={k}>{k}: <span style={{ color: "var(--text)", fontWeight: 500 }}>{v}</span></span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
