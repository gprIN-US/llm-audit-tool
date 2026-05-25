import { useState } from "react"
import AuditPage from "./pages/AuditPage"
import LeaderboardPage from "./pages/LeaderboardPage"
import BatchPage from "./pages/BatchPage"
import MethodologyPage from "./pages/MethodologyPage"

export default function App() {
  const [activePage, setActivePage] = useState("audit")

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <nav style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        height: "56px",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 100,
        backdropFilter: "blur(12px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginRight: "auto" }}>
          <span style={{ fontSize: "20px" }}>🔬</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--accent)" }}>
            LLM Audit
          </span>
          <span style={{
            fontSize: "10px",
            background: "var(--accent-dim)",
            color: "var(--accent)",
            padding: "2px 6px",
            borderRadius: "4px",
            fontFamily: "monospace"
          }}>v1.0</span>
        </div>

        {[
          { id: "audit", label: "Audit" },
          { id: "leaderboard", label: "Leaderboard" },
          { id: "batch", label: "Bulk Audit" },
          { id: "methodology", label: "Methodology" }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              background: "none",
              border: "none",
              color: activePage === item.id ? "var(--accent)" : "var(--text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              cursor: "pointer",
              padding: "4px 0",
              borderBottom: activePage === item.id ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.2s"
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main>
        {activePage === "audit" && <AuditPage />}
        {activePage === "leaderboard" && <LeaderboardPage />}
        {activePage === "batch" && <BatchPage />}
        {activePage === "methodology" && <MethodologyPage />}
      </main>
    </div>
  )
}
