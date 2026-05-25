export default function QualityDimensions({ dimensions }) {
  if (!dimensions?.length) return null

  return (
    <div className="card">
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Quality Breakdown</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {dimensions.map((dim, i) => {
          const pct = (dim.score / 10) * 100
          const color = pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--yellow)" : "var(--red)"
          return (
            <div key={i} style={{ padding: "12px 14px", background: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{dim.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{dim.score}/10</span>
              </div>
              <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginBottom: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>{dim.explanation}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
