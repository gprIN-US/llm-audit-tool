export default function BiasFlagsList({ flags }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>
          BIAS ANALYSIS
        </h3>
        <p style={{ color: "var(--green)", fontSize: "0.85rem" }}>
          No bias detected across all applicable rules.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", marginBottom: "1rem", color: "var(--text-muted)" }}>
        BIAS FLAGS ({flags.length} detected)
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {flags.map((flag, i) => (
          <div key={i} style={{
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-sm)",
            padding: "0.875rem",
            borderLeft: "3px solid var(--yellow)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--yellow)",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                {flag.rule_id}: {flag.rule_name}
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {Math.round(flag.confidence * 100)}% confidence
              </span>
            </div>

            <div style={{
              background: "rgba(251, 191, 36, 0.07)",
              borderRadius: "6px",
              padding: "0.5rem 0.75rem",
              fontSize: "0.85rem",
              fontStyle: "italic",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
              borderLeft: "2px solid var(--yellow)"
            }}>
              "{flag.triggered_text}"
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text)", marginBottom: "0.4rem" }}>
              {flag.explanation}
            </p>

            {flag.neutral_alternative && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>Neutral alternative: </span>
                {flag.neutral_alternative}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
