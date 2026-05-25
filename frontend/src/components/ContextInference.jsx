export default function ContextInference({ prompts, domain }) {
  return (
    <div style={{ background: "var(--blue-bg)", border: "1px solid var(--blue-border)", borderRadius: "var(--radius)", padding: "14px 18px", marginBottom: 12 }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        No prompt provided. Most likely questions:
      </p>
      <ul style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
        {prompts.map((p, i) => (
          <li key={i} style={{ fontSize: 13, color: "var(--text-muted)" }}>{p}</li>
        ))}
      </ul>
      <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
        Add the original prompt for higher accuracy.
      </p>
    </div>
  )
}
