export default function VerdictBanner({ passed, verdict, domain, contextMode }) {
  const color = passed ? "var(--green)" : "var(--red)"
  const bg = passed ? "var(--green-bg)" : "var(--red-bg)"
  const border = passed ? "var(--green-border)" : "var(--red-border)"

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: "var(--radius)", padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
            {passed ? "Passed evaluation" : "Did not pass"}
          </div>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.6 }}>{verdict}</p>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span className="tag tag-neutral">{domain}</span>
          {contextMode !== "full" && (
            <span className="tag tag-yellow">{contextMode === "inferred" ? "inferred context" : "no context"}</span>
          )}
        </div>
      </div>
    </div>
  )
}
