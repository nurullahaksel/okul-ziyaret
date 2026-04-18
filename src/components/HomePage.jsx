import { useState } from "react"

export default function HomePage({ onAdminClick, onBookingClick }) {
  const [hovered, setHovered] = useState(null)

  const card = (color, key) => ({
    background: `linear-gradient(135deg, ${color}22, ${color}11)`,
    border: `1.5px solid ${color}44`,
    borderRadius: 20, padding: "2rem", width: 240, cursor: "pointer",
    textAlign: "center", transition: "all 0.25s",
    backdropFilter: "blur(10px)",
    transform: hovered === key ? "translateY(-6px)" : "translateY(0)",
    boxShadow: hovered === key ? `0 20px 50px ${color}44` : "0 4px 20px rgba(0,0,0,0.3)"
  })

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a1628 0%, #102040 40%, #0d2535 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif", padding: "2rem", position: "relative", overflow: "hidden"
    }}>
      {/* Glow effects */}
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
        top: "-100px", left: "-100px", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
        bottom: "-80px", right: "-80px", pointerEvents: "none"
      }} />

      {/* Logo icon */}
      <div style={{
        zIndex: 1, width: 90, height: 90, borderRadius: "50%",
        background: "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 40, marginBottom: "1.5rem",
        boxShadow: "0 0 50px rgba(14,165,233,0.4)"
      }}>🏫</div>

      {/* Badge */}
      <div style={{
        zIndex: 1,
        background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)",
        borderRadius: 100, padding: "6px 18px", color: "#38bdf8",
        fontSize: "0.78rem", fontWeight: 700, letterSpacing: 1.5, marginBottom: "1.5rem",
        textTransform: "uppercase"
      }}>Samsun · Ziyaret Randevu Sistemi</div>

      {/* Title */}
      <h1 style={{
        zIndex: 1,
        color: "#fff", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 900,
        textAlign: "center", lineHeight: 1.2, marginBottom: "0.75rem",
        textShadow: "0 2px 20px rgba(14,165,233,0.3)"
      }}>
        Garip Zeycan Yıldırım<br />
        <span style={{ color: "#38bdf8" }}>Fen Lisesi</span>
      </h1>

      <p style={{
        zIndex: 1,
        color: "#94a3b8", fontSize: "1rem", textAlign: "center", marginBottom: "3rem", maxWidth: 440, lineHeight: 1.6
      }}>
        Okulumuzu ziyaret etmek isteyen okullar randevu alabilir.<br />
        Müsait tarihleri görmek için aşağıdaki butona tıklayın.
      </p>

      {/* Cards */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center", zIndex: 1 }}>

        {/* Ziyaret talep kartı */}
        <div style={card("#0ea5e9", "booking")}
          onMouseEnter={() => setHovered("booking")}
          onMouseLeave={() => setHovered(null)}
          onClick={onBookingClick}>
          <div style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>📋</div>
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Ziyaret Talep Et
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6 }}>
            Müsait tarihlere bakın ve okulunuz için randevu oluşturun
          </div>
          <div style={{
            marginTop: "1.5rem",
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
            color: "#fff", borderRadius: 10, padding: "10px 0",
            fontWeight: 700, fontSize: "0.9rem"
          }}>Randevu Al →</div>
        </div>

        {/* Admin kartı */}
        <div style={card("#10b981", "admin")}
          onMouseEnter={() => setHovered("admin")}
          onMouseLeave={() => setHovered(null)}
          onClick={onAdminClick}>
          <div style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>🔐</div>
          <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Rehber Öğretmen
          </div>
          <div style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.6 }}>
            Ziyaret takvimini yönetin ve başvuruları onaylayın
          </div>
          <div style={{
            marginTop: "1.5rem",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff", borderRadius: 10, padding: "10px 0",
            fontWeight: 700, fontSize: "0.9rem"
          }}>Yönetim Paneli →</div>
        </div>

      </div>

      <div style={{
        position: "absolute", bottom: "1.5rem",
        color: "#475569", fontSize: "0.75rem", textAlign: "center", zIndex: 1
      }}>
        © {new Date().getFullYear()} GZY Fen Lisesi – Samsun
      </div>
    </div>
  )
}
