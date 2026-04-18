import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { sendEmail, emailOnaylandı, emailİptalEdildi } from "../lib/email"

const inp = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
  color: "#fff", fontSize: "0.9rem", outline: "none",
  fontFamily: "'Nunito', sans-serif", boxSizing: "border-box"
}

const DAYS_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]
const MONTHS_TR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"]

function formatDate(d) {
  const dt = new Date(d)
  return `${dt.getDate()} ${MONTHS_TR[dt.getMonth()]} ${dt.getFullYear()}`
}
function formatTime(t) { return t?.slice(0,5) || "" }

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("slots") // slots | bookings
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Yeni slot form
  const [form, setForm] = useState({
    date: "", start_time: "09:00", end_time: "12:00", max_capacity: 60, notes: ""
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetchSlots()
    fetchBookings()

    // Realtime
    const ch = supabase.channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "visit_slots" }, fetchSlots)
      .on("postgres_changes", { event: "*", schema: "public", table: "visit_bookings" }, fetchBookings)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  async function fetchSlots() {
    const { data } = await supabase.from("visit_slots").select("*").order("date").order("start_time")
    setSlots(data || [])
    setLoading(false)
  }

  async function fetchBookings() {
    const { data } = await supabase.from("visit_bookings").select("*, visit_slots(date, start_time, end_time)").order("created_at", { ascending: false })
    setBookings(data || [])
  }

  async function handleAddSlot(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from("visit_slots").insert([{
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      max_capacity: parseInt(form.max_capacity),
      notes: form.notes
    }])
    if (error) setMsg("Hata: " + error.message)
    else {
      setMsg("✅ Slot eklendi!")
      setForm({ date: "", start_time: "09:00", end_time: "12:00", max_capacity: 60, notes: "" })
      setShowForm(false)
    }
    setSaving(false)
    setTimeout(() => setMsg(""), 3000)
  }

  async function handleDeleteSlot(id) {
    if (!confirm("Bu ziyaret slotunu silmek istediğinize emin misiniz?")) return
    await supabase.from("visit_slots").delete().eq("id", id)
  }

  async function handleUpdateBooking(booking, status) {
    await supabase.from("visit_bookings").update({ status }).eq("id", booking.id)
    fetchBookings()
    if (booking.contact_email && booking.visit_slots) {
      const d = { contact_name: booking.contact_name, school_name: booking.school_name, student_count: booking.student_count, date: booking.visit_slots.date, start_time: booking.visit_slots.start_time, end_time: booking.visit_slots.end_time }
      if (status === "onaylandi") sendEmail({ to: booking.contact_email, subject: 'Ziyaret Talebiniz Onaylandı – GZY Fen Lisesi', html: emailOnaylandı(d) })
      if (status === "iptal") sendEmail({ to: booking.contact_email, subject: 'Ziyaret Talebiniz Hakkında – GZY Fen Lisesi', html: emailİptalEdildi(d) })
    }
  }

  async function handleDeleteBooking(id) {
    if (!confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) return
    await supabase.from("visit_bookings").delete().eq("id", id)
  }

  const statusColor = (s) => s === "onaylandi" ? "#10b981" : s === "iptal" ? "#ef4444" : "#f59e0b"
  const statusLabel = (s) => s === "onaylandi" ? "✅ Onaylandı" : s === "iptal" ? "❌ İptal" : "⏳ Beklemede"

  const slotBookings = selectedSlot ? bookings.filter(b => b.slot_id === selectedSlot) : []

  return (
    <div style={{
      minHeight: "100vh", background: "#0a1628",
      fontFamily: "'Nunito', sans-serif", color: "#e2e8f0"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #102040, #0d2535)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>🔐</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem" }}>GZY Fen Lisesi – Yönetim Paneli</div>
            <div style={{ color: "#64748b", fontSize: "0.75rem" }}>Rehber Öğretmen</div>
          </div>
        </div>
        <button onClick={onLogout} style={{
          background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#fca5a5", borderRadius: 10, padding: "8px 16px",
          cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", fontFamily: "'Nunito', sans-serif"
        }}>Çıkış Yap</button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
          {[["slots", "📅 Ziyaret Slotları"], ["bookings", "📋 Başvurular"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: tab === key ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "rgba(255,255,255,0.06)",
              border: "none", color: "#fff", borderRadius: 10, padding: "10px 20px",
              fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem"
            }}>{label}</button>
          ))}
        </div>

        {msg && (
          <div style={{
            background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: 10, padding: "12px 16px", marginBottom: "1rem", color: "#6ee7b7"
          }}>{msg}</div>
        )}

        {/* ——— SLOTS TAB ——— */}
        {tab === "slots" && (
          <div>
            {/* Yeni slot ekle butonu */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button onClick={() => setShowForm(!showForm)} style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none", color: "#fff", borderRadius: 12, padding: "10px 20px",
                cursor: "pointer", fontWeight: 700, fontSize: "0.9rem", fontFamily: "'Nunito', sans-serif"
              }}>+ Yeni Ziyaret Günü Ekle</button>
            </div>

            {/* Form */}
            {showForm && (
              <div style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem"
              }}>
                <h3 style={{ margin: "0 0 1rem", fontWeight: 800, color: "#38bdf8" }}>Yeni Ziyaret Günü</h3>
                <form onSubmit={handleAddSlot}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Tarih</label>
                      <input type="date" style={inp} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                    </div>
                    <div>
                      <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Maksimum Öğrenci Sayısı</label>
                      <input type="number" style={inp} min={1} max={500} value={form.max_capacity}
                        onChange={e => setForm({ ...form, max_capacity: e.target.value })} required />
                    </div>
                    <div>
                      <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Başlangıç Saati</label>
                      <input type="time" style={inp} value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required />
                    </div>
                    <div>
                      <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Bitiş Saati</label>
                      <input type="time" style={inp} value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
                    </div>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Not (opsiyonel)</label>
                    <input type="text" style={inp} placeholder="Örn: Sadece fen lisesi öğrencileri" value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={saving} style={{
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      border: "none", color: "#fff", borderRadius: 10, padding: "10px 20px",
                      cursor: saving ? "not-allowed" : "pointer", fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif"
                    }}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
                    <button type="button" onClick={() => setShowForm(false)} style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#94a3b8", borderRadius: 10, padding: "10px 20px",
                      cursor: "pointer", fontFamily: "'Nunito', sans-serif"
                    }}>Vazgeç</button>
                  </div>
                </form>
              </div>
            )}

            {/* Slot listesi */}
            {loading ? (
              <div style={{ textAlign: "center", color: "#64748b", padding: "3rem" }}>Yükleniyor...</div>
            ) : slots.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "4rem", color: "#475569",
                background: "rgba(255,255,255,0.02)", borderRadius: 16,
                border: "1px dashed rgba(255,255,255,0.08)"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Henüz ziyaret günü eklenmemiş</div>
                <div style={{ fontSize: "0.85rem" }}>Yukarıdaki "+" butonunu kullanarak gün ekleyin</div>
              </div>
            ) : slots.map(slot => {
              const pct = Math.min(100, Math.round((slot.current_count / slot.max_capacity) * 100))
              const remaining = slot.max_capacity - slot.current_count
              const full = remaining <= 0
              const slotBk = bookings.filter(b => b.slot_id === slot.id)

              return (
                <div key={slot.id} style={{
                  background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, padding: "1.2rem 1.5rem", marginBottom: "1rem",
                  borderLeft: `4px solid ${full ? "#ef4444" : pct > 70 ? "#f59e0b" : "#10b981"}`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#f1f5f9" }}>
                        {formatDate(slot.date)}
                        <span style={{ color: "#64748b", fontWeight: 600, fontSize: "0.9rem", marginLeft: 8 }}>
                          ({DAYS_TR[new Date(slot.date).getDay()]})
                        </span>
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.88rem", marginTop: 2 }}>
                        🕐 {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        {slot.notes && <span style={{ marginLeft: 12, color: "#64748b" }}>· {slot.notes}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)} style={{
                        background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)",
                        color: "#38bdf8", borderRadius: 8, padding: "6px 14px",
                        cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Nunito', sans-serif", fontWeight: 600
                      }}>{selectedSlot === slot.id ? "Gizle" : `📋 ${slotBk.length} Başvuru`}</button>
                      <button onClick={() => handleDeleteSlot(slot.id)} style={{
                        background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                        color: "#fca5a5", borderRadius: 8, padding: "6px 14px",
                        cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Nunito', sans-serif", fontWeight: 600
                      }}>Sil</button>
                    </div>
                  </div>

                  {/* Kapasite çubuğu */}
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        {slot.current_count} / {slot.max_capacity} öğrenci
                      </span>
                      <span style={{
                        fontSize: "0.8rem", fontWeight: 700,
                        color: full ? "#ef4444" : remaining < 20 ? "#f59e0b" : "#10b981"
                      }}>
                        {full ? "⛔ Dolu" : `${remaining} yer kaldı`}
                      </span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: 4, transition: "width 0.5s",
                        background: full ? "#ef4444" : pct > 70 ? "#f59e0b" : "linear-gradient(90deg, #10b981, #0ea5e9)"
                      }} />
                    </div>
                  </div>

                  {/* Başvuru detayları */}
                  {selectedSlot === slot.id && (
                    <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
                      {slotBk.length === 0 ? (
                        <div style={{ color: "#64748b", fontSize: "0.85rem" }}>Bu slota henüz başvuru yok.</div>
                      ) : slotBk.map(b => (
                        <div key={b.id} style={{
                          background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px",
                          marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8
                        }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{b.school_name}</div>
                            <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                              👤 {b.contact_name} · 📞 {b.contact_phone} · 👥 {b.student_count} öğrenci
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{
                              background: `${statusColor(b.status)}22`,
                              border: `1px solid ${statusColor(b.status)}44`,
                              color: statusColor(b.status),
                              borderRadius: 8, padding: "4px 10px", fontSize: "0.78rem", fontWeight: 700
                            }}>{statusLabel(b.status)}</span>
                            {b.status !== "onaylandi" && (
                              <button onClick={() => handleUpdateBooking(b, "onaylandi")} style={{
                                background: "rgba(16,185,129,0.2)", border: "none", color: "#6ee7b7",
                                borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                                fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif"
                              }}>Onayla</button>
                            )}
                            {b.status !== "iptal" && (
                              <button onClick={() => handleUpdateBooking(b, "iptal")} style={{
                                background: "rgba(239,68,68,0.15)", border: "none", color: "#fca5a5",
                                borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                                fontSize: "0.78rem", fontFamily: "'Nunito', sans-serif"
                              }}>İptal</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ——— BOOKINGS TAB ——— */}
        {tab === "bookings" && (
          <div>
            <h3 style={{ margin: "0 0 1rem", fontWeight: 800, color: "#94a3b8" }}>
              Tüm Başvurular ({bookings.length})
            </h3>
            {bookings.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "4rem", color: "#475569",
                background: "rgba(255,255,255,0.02)", borderRadius: 16,
                border: "1px dashed rgba(255,255,255,0.08)"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <div style={{ fontWeight: 700 }}>Henüz başvuru yok</div>
              </div>
            ) : bookings.map(b => (
              <div key={b.id} style={{
                background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: 14, padding: "1.1rem 1.4rem", marginBottom: "0.8rem",
                borderLeft: `4px solid ${statusColor(b.status)}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>{b.school_name}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.82rem", display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
                      <span>📅 {b.visit_slots ? formatDate(b.visit_slots.date) : "?"} {b.visit_slots ? `${formatTime(b.visit_slots.start_time)}-${formatTime(b.visit_slots.end_time)}` : ""}</span>
                      <span>👥 {b.student_count} öğrenci</span>
                      <span>👤 {b.contact_name}</span>
                      <span>📞 {b.contact_phone}</span>
                      {b.contact_email && <span>✉️ {b.contact_email}</span>}
                    </div>
                    {b.notes && <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: 4 }}>Not: {b.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                    <span style={{
                      background: `${statusColor(b.status)}22`, border: `1px solid ${statusColor(b.status)}44`,
                      color: statusColor(b.status), borderRadius: 8, padding: "5px 12px",
                      fontSize: "0.8rem", fontWeight: 700
                    }}>{statusLabel(b.status)}</span>
                    {b.status !== "onaylandi" && (
                      <button onClick={() => handleUpdateBooking(b, "onaylandi")} style={{
                        background: "rgba(16,185,129,0.2)", border: "none", color: "#6ee7b7",
                        borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                        fontSize: "0.8rem", fontFamily: "'Nunito', sans-serif"
                      }}>Onayla</button>
                    )}
                    {b.status !== "iptal" && (
                      <button onClick={() => handleUpdateBooking(b, "iptal")} style={{
                        background: "rgba(239,68,68,0.15)", border: "none", color: "#fca5a5",
                        borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                        fontSize: "0.8rem", fontFamily: "'Nunito', sans-serif"
                      }}>İptal</button>
                    )}
                    <button onClick={() => handleDeleteBooking(b.id)} style={{
                      background: "rgba(239,68,68,0.1)", border: "none", color: "#f87171",
                      borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                      fontSize: "0.8rem", fontFamily: "'Nunito', sans-serif"
                    }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
