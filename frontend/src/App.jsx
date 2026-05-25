import { useState } from "react"
import AuditPage from "./pages/AuditPage"
import LeaderboardPage from "./pages/LeaderboardPage"
import BatchPage from "./pages/BatchPage"
import MethodologyPage from "./pages/MethodologyPage"

export default function App() {
  const [page, setPage] = useState("audit")

  const nav = [
    { id: "audit", label: "Audit" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "batch", label: "Bulk Audit" },
    { id: "methodology", label: "How it works" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(250,250,248,0.92)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}>
          <button
            onClick={() => setPage("audit")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.1rem",
              color: "var(--text)",
              fontStyle: "italic",
            }}>
              Audit
            </span>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1.1rem",
              color: "var(--text)",
              fontWeight: 300,
            }}>
              AI
            </span>
          </button>

          <nav style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {nav.map(item => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`btn-ghost ${page === item.id ? "active" : ""}`}
                style={{
                  fontSize: "13px",
                  fontWeight: page === item.id ? 500 : 400,
                  color: page === item.id ? "var(--text)" : "var(--text-muted)",
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {page === "audit" && <AuditPage />}
        {page === "leaderboard" && <LeaderboardPage />}
        {page === "batch" && <BatchPage />}
        {page === "methodology" && <MethodologyPage />}
      </main>
    </div>
  )
}
