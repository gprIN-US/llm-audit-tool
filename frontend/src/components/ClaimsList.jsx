const STYLES = {
  verified: { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)", label: "Verified" },
  unverifiable: { color: "var(--yellow)", bg: "var(--yellow-bg)", border: "var(--yellow-border)", label: "Unverifiable" },
  contradicted: { color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)", label: "Contradicted" },
}

export default function ClaimsList({ claims }) {
  if (!claims?.length) return (
    <div className="card">
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Factual Claims</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No verifiable claims found or hallucination check was skipped for this content type.</p>
    </div>
  )

  return (
    <div className="card">
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Factual Claims <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({claims.length})</span></p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {claims.map((claim, i) => {
          const s = STYLES[claim.verdict] || STYLES.unverifiable
          return (
            <div key={i} style={{ padding: "12px 14px", background: s.bg, border: `1px solid ${s.border}`, borderRadius: "var(--radius-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 13, lineHeight: 1.5, flex: 1 }}>{claim.text}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{Math.round(claim.confidence * 100)}%</span>
                  <span className={`tag ${claim.verdict === "verified" ? "tag-green" : claim.verdict === "contradicted" ? "tag-red" : "tag-yellow"}`}>{s.label}</span>
                </div>
              </div>
              {claim.source_url && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>Source:</span>
                  <a href={claim.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", textDecoration: "none" }}>
                    {claim.source_title || claim.source_url}
                  </a>
                  {claim.source_tier && <span className="tag tag-neutral">Tier {claim.source_tier}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
