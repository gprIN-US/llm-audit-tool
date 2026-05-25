const VERDICT_STYLES = {
  verified: { color: "var(--green)", bg: "var(--green-dim)", label: "Verified" },
  unverifiable: { color: "var(--yellow)", bg: "var(--yellow-dim)", label: "Unverifiable" },
  contradicted: { color: "var(--red)", bg: "var(--red-dim)", label: "Contradicted" }
}

export default function ClaimsList({ claims }) {
  if (!claims || claims.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>
          CLAIM BREAKDOWN
        </h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          No verifiable factual claims were found in this response, or hallucination check was skipped for this content type.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", marginBottom: "1rem", color: "var(--text-muted)" }}>
        CLAIM BREAKDOWN ({claims.length} claims extracted)
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {claims.map((claim, i) => {
          const style = VERDICT_STYLES[claim.verdict] || VERDICT_STYLES.unverifiable
          return (
            <div key={i} style={{
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-sm)",
              padding: "0.875rem",
              borderLeft: `3px solid ${style.color}`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", lineHeight: 1.5, flex: 1 }}>
                  {claim.text}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                  <span style={{
                    fontSize: "10px",
                    color: "var(--text-muted)"
                  }}>
                    {Math.round(claim.confidence * 100)}% confidence
                  </span>
                  <span style={{
                    background: style.bg,
                    color: style.color,
                    border: `1px solid ${style.color}`,
                    borderRadius: "100px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase"
                  }}>
                    {style.label}
                  </span>
                </div>
              </div>

              {claim.source_url && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Source:</span>
                  <a
                    href={claim.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "11px", color: "var(--accent)", textDecoration: "none" }}
                  >
                    {claim.source_title || claim.source_url}
                  </a>
                  {claim.source_tier && (
                    <span style={{
                      fontSize: "10px",
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      borderRadius: "4px",
                      padding: "1px 5px"
                    }}>
                      Tier {claim.source_tier}
                    </span>
                  )}
                </div>
              )}

              {claim.conflicting_source && (
                <div style={{ marginTop: "0.4rem", fontSize: "11px", color: "var(--yellow)" }}>
                  Conflict detected with: {claim.conflicting_source}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
