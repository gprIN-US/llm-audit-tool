export default function ContextInference({ prompts, domain }) {
  return (
    <div style={{
      background: "var(--accent-dim)",
      border: "1px solid var(--accent)",
      borderRadius: "var(--radius)",
      padding: "1rem 1.25rem",
      marginBottom: "1rem"
    }}>
      <p style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600, marginBottom: "0.5rem" }}>
        No prompt provided. We detected this response likely answers one of these:
      </p>
      <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {prompts.map((p, i) => (
          <li key={i} style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {p}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.5rem" }}>
        Results are marked as "inferred context" for transparency. Add the original prompt for full accuracy.
      </p>
    </div>
  )
}
