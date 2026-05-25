export default function ProgressTracker({ steps }) {
  return (
    <div style={{ padding: "16px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginTop: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ fontSize: 13, color: i === steps.length - 1 ? "var(--text)" : "var(--text-dim)", display: "flex", gap: 8 }}>
            <span style={{ width: 14, fontSize: 11, color: "var(--green)" }}>{i === steps.length - 1 ? "→" : "✓"}</span>
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}
