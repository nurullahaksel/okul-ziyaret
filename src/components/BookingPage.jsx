import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

const MONTHS_TR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"]
const DAYS_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]

function formatDate(d) {
  const dt = new Date(d)
  return `${DAYS_TR[dt.getDay()]}, ${dt.getDate()} ${MONTHS_TR[dt.getMonth()]} ${dt.getFullYear()}`
}
function formatTime(t) { return t?.slice(0, 5) || "" }

const inp = (extra = {}) => ({
  width: "100%", padding: "11px 14px", borderRadius: 10,
  background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
  color: "#fff", fontSize: "0.9rem", outline: "none",
  fontFamily: "'Nunito', sans-serif", boxSizing: "border-box", ...extra
})

export default function BookingPage({ onBack }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [step, setStep] = useState("list") // list | form | success
  const [form, setForm] = useState({
    school_name: "", contact_name: "", contact_phone: "", contact_email: "", student_count: "", notes: ""
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSlots()
    // Realtime güncellemeler
    const ch = supabase.channel("booking-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "visit_slots" }, fetchSlots)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function fetchSlots() {
    const { data } = await supabase
      .from("visit_slots")
      .select("*")
      .order("date")
      .order("start_time")
    // Sadece gelecekteki slotları göster
    const today = new Date().toISOString().split("T")[0]
    setSlots((data || []).filter(s => s.date >= today))
    setLoading(false)
  }

  function handleSelectSlot(slot) {
    setSelectedSlot(slot)
    setForm({ school_name: "", contact_name: "", contact_phone: "", contact_email: "", student_count: "", notes: "" })
    setError("")
    setStep("form")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    const count = parseInt(form.student_count)
    if (count <= 0) { setError("Geçerli bir öğrenci sayısı girin."); return }
    const remaining = selectedSlot.max_capacity - selectedSlot.current_count
    if (count > remaining) {
      setError(`Bu slotta yalnızca ${remaining} yer kaldı. Lütfen öğrenci sayısını azaltın.`)
      return
    }

    setSaving(true)
    const { error: err } = await supabase.from("visit_bookings").insert([{
      slot_id: selectedSlot.id,
      school_name: form.school_name,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
      student_count: count,
      notes: form.notes
    }])

    if (err) {
      console.error("Booking error:", err)
      if (err.code === "42501") {
        setError("Sunucu yapılandırma hatası. Lütfen yöneticiyle iletişime geçin.")
      } else {
        setError("Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.")
      }
    } else {
      setStep("success")
    }
    setSaving(false)
  }

  const remaining = selectedSlot ? selectedSlot.max_capacity - selectedSlot.current_count : 0

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a1628 0%, #102040 40%, #0d2535 100%)",
      fontFamily: "'Nunito', sans-serif", color: "#e2e8f0", padding: "2rem 1rem"
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "#64748b",
            cursor: "pointer", fontSize: "0.85rem", padding: 0,
            display: "flex", alignItems: "center", gap: 6, marginBottom: "1.2rem"
          }}>← Ana Sayfaya Dön</button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              boxShadow: "0 0 30px rgba(14,165,233,0.3)"
            }}>📋</div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 900, fontSize: "1.5rem", color: "#fff" }}>Ziyaret Randevu Talebi</h1>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>GZY Fen Lisesi – Samsun</p>
            </div>
          </div>
        </div>

        {/* ——— SLOT LİSTESİ ——— */}
        {step === "list" && (
          <div>
            <div style={{
              background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)",
              borderRadius: 12, padding: "12px 16px", marginBottom: "1.5rem", fontSize: "0.88rem", color: "#7dd3fc"
            }}>
              💡 Uygun olan tarihi seçin ve randevunuzu oluşturun. Birden fazla okul aynı güne kayıt yapabilir.
            </div>

            {loading ? (
              <div style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>Yükleniyor...</div>
            ) : slots.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "4rem", color: "#475569",
                background: "rgba(255,255,255,0.02)", borderRadius: 16,
                border: "1px dashed rgba(255,255,255,0.08)"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Şu an müsait ziyaret günü bulunmuyor</div>
                <div style={{ fontSize: "0.85rem" }}>Lütfen daha sonra tekrar kontrol edin.</div>
              </div>
            ) : slots.map(slot => {
              const rem = slot.max_capacity - slot.current_count
              const full = rem <= 0
              const pct = Math.min(100, Math.round((slot.current_count / slot.max_capacity) * 100))

              return (
                <div key={slot.id} style={{
                  background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, padding: "1.3rem 1.5rem", marginBottom: "1rem",
                  borderLeft: `4px solid ${full ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981"}`,
                  opacity: full ? 0.6 : 1
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#f1f5f9", marginBottom: 4 }}>
                        📅 {formatDate(slot.date)}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                        🕐 {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        {slot.notes && <span style={{ marginLeft: 12, color: "#64748b" }}>· {slot.notes}</span>}
                      </div>

                      {/* Kapasite bar */}
                      <div style={{ marginTop: "0.75rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                            {slot.current_count} / {slot.max_capacity} öğrenci kayıtlı
                          </span>
                          <span style={{
                            fontSize: "0.78rem", fontWeight: 700,
                            color: full ? "#ef4444" : rem < 20 ? "#f59e0b" : "#10b981"
                          }}>
                            {full ? "⛔ Dolu" : `${rem} yer kaldı`}
                          </span>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${pct}%`, borderRadius: 3, transition: "width 0.5s",
                            background: full ? "#ef4444" : pct > 70 ? "#f59e0b" : "linear-gradient(90deg, #10b981, #0ea5e9)"
                          }} />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => !full && handleSelectSlot(slot)}
                      disabled={full}
                      style={{
                        background: full ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #0ea5e9, #0284c7)",
                        border: "none", color: full ? "#475569" : "#fff",
                        borderRadius: 10, padding: "10px 20px", cursor: full ? "not-allowed" : "pointer",
                        fontWeight: 700, fontSize: "0.9rem", fontFamily: "'Nunito', sans-serif",
                        whiteSpace: "nowrap", alignSelf: "flex-start"
                      }}
                    >
                      {full ? "Dolu" : "Randevu Al →"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ——— FORM ——— */}
        {step === "form" && selectedSlot && (
          <div>
            {/* Seçilen slot özeti */}
            <div style={{
              background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)",
              borderRadius: 12, padding: "1rem 1.2rem", marginBottom: "1.5rem"
            }}>
              <div style={{ fontWeight: 700, color: "#38bdf8", marginBottom: 2 }}>Seçilen Tarih</div>
              <div style={{ fontWeight: 800, color: "#fff" }}>{formatDate(selectedSlot.date)}</div>
              <div style={{ color: "#7dd3fc", fontSize: "0.88rem" }}>
                {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)} &nbsp;·&nbsp;
                <span style={{ fontWeight: 700 }}>Kalan yer: {remaining}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <h3 style={{ margin: "0 0 1.2rem", fontWeight: 800, color: "#94a3b8", fontSize: "0.95rem", letterSpacing: 1, textTransform: "uppercase" }}>
                Okul Bilgileri
              </h3>

              <div style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
                    Okul Adı *
                  </label>
                  <input type="text" style={inp()} required
                    placeholder="Örn: Samsun Atatürk Anadolu Lisesi"
                    value={form.school_name} onChange={e => setForm({ ...form, school_name: e.target.value })} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
                      İlgili Öğretmen / Kişi *
                    </label>
                    <input type="text" style={inp()} required
                      placeholder="Ad Soyad"
                      value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
                      Telefon Numarası *
                    </label>
                    <input type="tel" style={inp()} required
                      placeholder="05XX XXX XX XX"
                      value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
                      E-posta (opsiyonel)
                    </label>
                    <input type="email" style={inp()} placeholder="okul@meb.gov.tr"
                      value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
                      Öğrenci Sayısı * <span style={{ color: "#f59e0b" }}>(max: {remaining})</span>
                    </label>
                    <input type="number" style={inp()} required min={1} max={remaining}
                      placeholder={`1 – ${remaining}`}
                      value={form.student_count} onChange={e => setForm({ ...form, student_count: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 5 }}>
                    Ekstra Not (opsiyonel)
                  </label>
                  <input type="text" style={inp()} placeholder="Özel istek veya bilgi..."
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>

              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10, padding: "10px 14px", color: "#fca5a5",
                  fontSize: "0.85rem", marginBottom: "1rem"
                }}>{error}</div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setStep("list")} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8", borderRadius: 12, padding: "12px 20px",
                  cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 600
                }}>← Geri</button>
                <button type="submit" disabled={saving} style={{
                  flex: 1,
                  background: saving ? "#374151" : "linear-gradient(135deg, #10b981, #059669)",
                  border: "none", color: "#fff", borderRadius: 12, padding: "12px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 800, fontSize: "1rem", fontFamily: "'Nunito', sans-serif"
                }}>{saving ? "Gönderiliyor..." : "Randevu Talebini Gönder ✓"}</button>
              </div>
            </form>
          </div>
        )}

        {/* ——— BAŞARI ——— */}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, margin: "0 auto 1.5rem",
              boxShadow: "0 0 50px rgba(16,185,129,0.4)"
            }}>✅</div>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: "1.6rem", marginBottom: "0.5rem" }}>
              Talebiniz Alındı!
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", maxWidth: 380, margin: "0 auto 2rem", lineHeight: 1.6 }}>
              Ziyaret talebiniz GZY Fen Lisesi rehber öğretmenine iletildi.<br />
              En kısa sürede sizinle iletişime geçilecektir.
            </p>
            {selectedSlot && (
              <div style={{
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 12, padding: "1rem", maxWidth: 380, margin: "0 auto 2rem", textAlign: "left"
              }}>
                <div style={{ color: "#6ee7b7", fontWeight: 700, marginBottom: 4 }}>Randevu Bilgisi</div>
                <div style={{ color: "#f1f5f9" }}>{formatDate(selectedSlot.date)}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.88rem" }}>
                  {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.88rem", marginTop: 4 }}>
                  Okul: {form.school_name} · {form.student_count} öğrenci
                </div>
              </div>
            )}
            <button onClick={onBack} style={{
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              border: "none", color: "#fff", borderRadius: 12, padding: "12px 28px",
              cursor: "pointer", fontWeight: 700, fontSize: "1rem", fontFamily: "'Nunito', sans-serif"
            }}>Ana Sayfaya Dön</button>
          </div>
        )}
      </div>
    </div>
  )
}
