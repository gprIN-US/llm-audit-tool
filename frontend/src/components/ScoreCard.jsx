export default function ScoreCard({ title, score, subtitle, type, maxScore = 100 }) {
  const getColor = () => {
    const pct = maxScore === 10 ? (score / 10) * 100 : score
    if (pct >= 80) return "var(--green)"
    if (pct >= 60) return "var(--yellow)"
    return "var(--red)"
  }

  const getBg = () => {
    const pct = maxScore === 10 ? (score / 10) * 100 : score
    if (pct >= 80) return "var(--green-dim)"
    if (pct >= 60) return "var(--yellow-dim)"
    return "var(--red-dim)"
  }

  const getEmoji = () => {
    const pct = maxScore === 10 ? (score / 10) * 100 : score
    if (pct >= 80) return "passed"
    if (pct >= 60) return "review"
    return "failed"
  }

  const color = getColor()
  const bg = getBg()
  const status = getEmoji()

  const displayScore = maxScore === 10
    ? `${score}/10`
    : `${score}%`

  return (
    <div className="card" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: color
      }} />

      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: bg,
        border: `1px solid ${color}`,
        borderRadius: "100px",
        padding: "3px 10px",
        fontSize: "11px",
        color: color,
        fontWeight: 600,
        marginBottom: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}>
        {status}
      </div>

      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "2.5rem",
        fontWeight: 700,
        color: color,
        lineHeight: 1,
        marginBottom: "0.5rem"
      }}>
        {displayScore}
      </div>

      <div style={{
        fontSize: "0.8rem",
        fontWeight: 600,
        color: "var(--text)",
        marginBottom: "0.4rem"
      }}>
        {title}
      </div>

      <div style={{
        fontSize: "0.75rem",
        color: "var(--text-muted)",
        lineHeight: 1.4
      }}>
        {subtitle}
      </div>
    </div>
  )
}
