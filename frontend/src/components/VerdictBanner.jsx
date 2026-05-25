export default function VerdictBanner({ passed, verdict, domain, contextMode, rulesetVersion }) {
  const color = passed ? "var(--green)" : "var(--red)"
  const bg = passed ? "var(--green-dim)" : "var(--red-dim)"

  return (
    <div style={{
      background: bg,
      border: `1px solid ${color}`,
      borderRadius: "var(--radius)",
      padding: "1.25rem 1.5rem"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 700,
            color: color,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "0.4rem"
          }}>
            {passed ? "Passed Evaluation" : "Did Not Pass Evaluation"}
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5 }}>
            {verdict}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "flex-end", flexShrink: 0 }}>
          <span style={{
            fontSize: "10px",
            background: "var(--accent-dim)",
            color: "var(--accent)",
            padding: "2px 6px",
            borderRadius: "4px"
          }}>
            {domain}
          </span>
          {contextMode === "inferred" && (
            <span style={{
              fontSize: "10px",
              background: "var(--yellow-dim)",
              color: "var(--yellow)",
              padding: "2px 6px",
              borderRadius: "4px"
            }}>
              context inferred
            </span>
          )}
          {contextMode === "none" && (
            <span style={{
              fontSize: "10px",
              background: "var(--yellow-dim)",
              color: "var(--yellow)",
              padding: "2px 6px",
              borderRadius: "4px"
            }}>
              no context
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
