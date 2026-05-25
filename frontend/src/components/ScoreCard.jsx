export default function ScoreCard({ title, score, subtitle, type }) {
  const pct = type === "ten" ? (score / 10) * 100 : score
  const color = pct >= 80 ? "var(--green)" : pct >= 60 ? "var(--yellow)" : "var(--red)"
  const bg = pct >= 80 ? "var(--green-bg)" : pct >= 60 ? "var(--yellow-bg)" : "var(--red-bg)"
  const border = pct >= 80 ? "var(--green-border)" : pct >= 60 ? "var(--yellow-border)" : "var(--red-border)"
  const status = pct >= 80 ? "Passed" : pct >= 60 ? "Review" : "Failed"
  const display = type === "ten" ? `${score}/10` : `${score}%`

  return (
    <div style={{
      border: `1px solid ${border}`,
      borderRadius: "var(--radius)",
      padding: "18px 16px",
      background: bg,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {title}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color, padding: "2px 7px", background: "white", borderRadius: 100, border: `1px solid ${border}` }}>
          {status}
        </span>
      </div>
      <div style={{ fontSize: "1.9rem", fontWeight: 600, color, fontFamily: "var(--font-sans)", lineHeight: 1, marginBottom: 6 }}>
        {display}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
        {subtitle}
      </div>
    </div>
  )
}
