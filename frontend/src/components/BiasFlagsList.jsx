export default function BiasFlagsList({ flags }) {
  if (!flags?.length) return (
    <div className="card">
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Bias Analysis</p>
      <p style={{ fontSize: 13, color: "var(--green)" }}>No bias detected across all applicable rules.</p>
    </div>
  )

  return (
    <div className="card">
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Bias Flags <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>({flags.length})</span></p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {flags.map((flag, i) => (
          <div key={i} style={{ padding: "12px 14px", background: "var(--yellow-bg)", border: "1px solid var(--yellow-border)", borderRadius: "var(--radius-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--yellow)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {flag.rule_id}: {flag.rule_name}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{Math.round(flag.confidence * 100)}% confidence</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", marginBottom: 6, padding: "6px 10px", background: "rgba(180,83,9,0.05)", borderRadius: 4, borderLeft: "2px solid var(--yellow-border)" }}>
              "{flag.triggered_text}"
            </p>
            <p style={{ fontSize: 13, color: "var(--text)", marginBottom: flag.neutral_alternative ? 6 : 0 }}>{flag.explanation}</p>
            {flag.neutral_alternative && (
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>Better: </span>{flag.neutral_alternative}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
