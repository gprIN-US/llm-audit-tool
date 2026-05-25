import { useState, useEffect } from "react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

export default function LeaderboardPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("hallucination_score")
  const [filterCategory, setFilterCategory] = useState("all")

  useEffect(() => {
    fetch(`${API_BASE}/leaderboard`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const sorted = [...data].sort((a, b) => b[sortBy] - a[sortBy])

  const categories = ["all", "medical", "historical", "scientific", "technical", "general"]

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
          marginBottom: "0.5rem"
        }}>
          Model Leaderboard
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Same 50 prompts. Same 40 rules. Every model scored the same way.
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div>
          <label style={{ marginBottom: "0.3rem" }}>Sort by</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text)",
              padding: "0.5rem 0.75rem",
              fontFamily: "var(--font-body)",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            <option value="hallucination_score">Hallucination Score</option>
            <option value="bias_score">Bias Score</option>
            <option value="quality_score">Quality Score</option>
          </select>
        </div>

        <div>
          <label style={{ marginBottom: "0.3rem" }}>Category</label>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {categories.map(cat => (
              <button
                key={cat}
                className="btn-ghost"
                onClick={() => setFilterCategory(cat)}
                style={{
                  borderColor: filterCategory === cat ? "var(--accent)" : undefined,
                  color: filterCategory === cat ? "var(--accent)" : undefined,
                  padding: "0.4rem 0.8rem",
                  fontSize: "0.8rem"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading leaderboard...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {sorted.map((entry, i) => {
            const catScore = filterCategory !== "all"
              ? entry.category_scores?.[filterCategory]
              : null

            return (
              <div key={i} className="card" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  color: i === 0 ? "var(--yellow)" : "var(--text-dim)",
                  width: "2rem",
                  textAlign: "center",
                  flexShrink: 0
                }}>
                  #{i + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.2rem" }}>
                    {entry.model_name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {entry.model_version} | Evaluated {entry.evaluation_date} | Ruleset {entry.ruleset_version}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", flexShrink: 0 }}>
                  {[
                    { label: "Hallucination", value: `${entry.hallucination_score}%`, key: "hallucination_score" },
                    { label: "Bias", value: `${entry.bias_score}%`, key: "bias_score" },
                    { label: "Quality", value: `${entry.quality_score}/10`, key: "quality_score" }
                  ].map(metric => {
                    const isActive = sortBy === metric.key
                    return (
                      <div key={metric.key} style={{ textAlign: "center" }}>
                        <div style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: isActive ? "var(--accent)" : "var(--text)"
                        }}>
                          {metric.value}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                          {metric.label}
                        </div>
                      </div>
                    )
                  })}

                  {catScore && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--yellow)"
                      }}>
                        {catScore}%
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        {filterCategory}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{
        marginTop: "2rem",
        padding: "1rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.75rem",
        color: "var(--text-muted)"
      }}>
        Independent evaluation for research purposes using publicly available APIs under each provider's standard terms of service.
        Scores reflect performance on this specific 50-prompt benchmark set and should not be interpreted as definitive general rankings.
        All prompts are published openly in /docs/leaderboard-prompts.md.
      </div>
    </div>
  )
}
