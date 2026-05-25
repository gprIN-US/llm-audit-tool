import { useState, useRef } from "react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api"

export default function BatchPage() {
  const [file, setFile] = useState(null)
  const [items, setItems] = useState([])
  const [batchId, setBatchId] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef()

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setError(null)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target.result
      const lines = text.trim().split("\n")
      const parsed = []

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",")
        if (cols.length >= 1) {
          parsed.push({
            response_text: cols[0]?.trim().replace(/^"|"$/g, "") || "",
            prompt_text: cols[1]?.trim().replace(/^"|"$/g, "") || null,
            model_name: cols[2]?.trim().replace(/^"|"$/g, "") || null
          })
        }
      }

      const valid = parsed.filter(p => p.response_text.length >= 10)
      setItems(valid)
    }
    reader.readAsText(f)
  }

  const startBatch = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.slice(0, 100) })
      })
      const data = await response.json()
      setBatchId(data.batch_id)
      setStatus(data)

      const poll = setInterval(async () => {
        const r = await fetch(`${API_BASE}/batch/${data.batch_id}`)
        const s = await r.json()
        setStatus(s)
        if (s.status === "completed") {
          clearInterval(poll)
          setLoading(false)
        }
      }, 2000)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const downloadResults = () => {
    if (!status?.results) return
    const rows = [
      ["evaluation_id", "domain", "hallucination_score", "bias_score", "quality_score", "passed", "verdict"]
    ]
    status.results.forEach(r => {
      if (!r.error) {
        rows.push([
          r.evaluation_id,
          r.domain,
          r.hallucination?.score,
          r.bias?.score,
          r.quality?.overall_score,
          r.overall_passed,
          r.overall_verdict?.replace(/,/g, ";")
        ])
      }
    })
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-results-${batchId}.csv`
    a.click()
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", marginBottom: "0.5rem" }}>
          Bulk Audit
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Upload a CSV and evaluate up to 100 AI responses in one batch. Download results as CSV.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
          CSV FORMAT
        </h3>
        <div style={{
          background: "var(--bg-elevated)",
          borderRadius: "var(--radius-sm)",
          padding: "0.75rem 1rem",
          fontFamily: "var(--font-display)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginBottom: "0.75rem"
        }}>
          response_text, prompt_text (optional), model_name (optional)
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          First row must be headers. Only response_text is required. Max 100 rows.
        </p>
      </div>

      <div
        style={{
          border: "2px dashed var(--border-bright)",
          borderRadius: "var(--radius)",
          padding: "2.5rem",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: "1.5rem",
          transition: "border-color 0.2s"
        }}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: "none" }} />
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📄</div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {file ? `${file.name} (${items.length} valid rows detected)` : "Click to upload CSV file"}
        </p>
      </div>

      {error && (
        <div style={{
          background: "var(--red-dim)", border: "1px solid var(--red)",
          borderRadius: "var(--radius-sm)", padding: "0.75rem 1rem",
          color: "var(--red)", fontSize: "0.85rem", marginBottom: "1rem"
        }}>
          {error}
        </div>
      )}

      {items.length > 0 && !batchId && (
        <button className="btn-primary" onClick={startBatch} disabled={loading}>
          Start Batch Audit ({Math.min(items.length, 100)} responses)
        </button>
      )}

      {status && (
        <div className="card animate-in" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              BATCH {batchId}
            </h3>
            <span style={{
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "100px",
              background: status.status === "completed" ? "var(--green-dim)" : "var(--accent-dim)",
              color: status.status === "completed" ? "var(--green)" : "var(--accent)",
              fontWeight: 600,
              textTransform: "uppercase"
            }}>
              {status.status}
            </span>
          </div>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--accent)" }}>
                {status.completed}/{status.total}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>COMPLETED</div>
            </div>
          </div>

          <div style={{
            height: "6px",
            background: "var(--border)",
            borderRadius: "3px",
            overflow: "hidden",
            marginBottom: "1rem"
          }}>
            <div style={{
              height: "100%",
              width: `${(status.completed / status.total) * 100}%`,
              background: "var(--accent)",
              borderRadius: "3px",
              transition: "width 0.3s ease"
            }} />
          </div>

          {status.status === "completed" && (
            <button className="btn-primary" onClick={downloadResults}>
              Download Results CSV
            </button>
          )}
        </div>
      )}
    </div>
  )
}
