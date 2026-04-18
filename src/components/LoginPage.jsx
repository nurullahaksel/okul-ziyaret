import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function LoginPage({ onSuccess, onBack }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError("Kullanıcı adı veya şifre hatalı.")
    else onSuccess()
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a1628 0%, #102040 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif", padding: "2rem"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
        borderRadius: 24, padding: "2.5rem", width: "100%", maxWidth: 400,
        backdropFilter: "blur(20px)"
      }}>
        {/* Geri */}
        <button onClick={onBack} style={{
          background: "none", border: "none", color: "#64748b", cursor: "pointer",
          fontSize: "0.85rem", marginBottom: "1.5rem", padding: 0, display: "flex", alignItems: "center", gap: 6
        }}>← Ana Sayfa</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 1rem",
            boxShadow: "0 0 30px rgba(16,185,129,0.4)"
          }}>🔐</div>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>Rehber Öğretmen Girişi</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: 6 }}>GZY Fen Lisesi Yönetim Paneli</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
              E-posta
            </label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@meb.gov.tr"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: "0.95rem", outline: "none",
                fontFamily: "'Nunito', sans-serif", boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
              Şifre
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: "0.95rem", outline: "none",
                fontFamily: "'Nunito', sans-serif", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", color: "#fca5a5",
              fontSize: "0.85rem", marginBottom: "1rem"
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: 12,
            background: loading ? "#374151" : "linear-gradient(135deg, #10b981, #059669)",
            border: "none", color: "#fff", fontWeight: 700, fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Nunito', sans-serif",
            transition: "all 0.2s"
          }}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  )
}
