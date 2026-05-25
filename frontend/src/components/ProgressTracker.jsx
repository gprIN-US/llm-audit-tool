export default function ProgressTracker({ steps }) {
  return (
    <div className="card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div className="pulse" style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "var(--accent)"
        }} />
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-display)" }}>
          EVALUATING
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {steps.map((step, i) => (
          <div key={i} className="animate-in" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.85rem",
            color: i === steps.length - 1 ? "var(--text)" : "var(--text-muted)"
          }}>
            <span style={{ color: "var(--green)", fontSize: "12px" }}>
              {i === steps.length - 1 ? ">" : ""}
            </span>
            <span style={{ fontFamily: i === steps.length - 1 ? "var(--font-display)" : "var(--font-body)" }}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
