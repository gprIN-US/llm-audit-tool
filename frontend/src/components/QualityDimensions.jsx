export default function QualityDimensions({ dimensions }) {
  if (!dimensions || dimensions.length === 0) return null

  return (
    <div className="card">
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", marginBottom: "1rem", color: "var(--text-muted)" }}>
        QUALITY BREAKDOWN
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {dimensions.map((dim, i) => {
          const pct = (dim.score / 10) * 100
          const color = pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--yellow)" : "var(--red)"
          return (
            <div key={i} style={{
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-sm)",
              padding: "0.875rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)" }}>
                  {dim.name}
                </span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: color
                }}>
                  {dim.score}/10
                </span>
              </div>
              <div style={{
                height: "4px",
                background: "var(--border)",
                borderRadius: "2px",
                marginBottom: "0.5rem",
                overflow: "hidden"
              }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: color,
                  borderRadius: "2px",
                  transition: "width 0.8s ease"
                }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                {dim.explanation}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
