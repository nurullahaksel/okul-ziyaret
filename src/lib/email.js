const RESEND_KEY = 're_Gx8SbtY4_4yA2pxxJJcvgXGXv5nKd75sz'
export const ADMIN_EMAIL = 'aysunyukselgzy@gmail.com'
const FROM = 'GZY Fen Lisesi <onboarding@resend.dev>'

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"]
export function fmtDate(d) {
  const dt = new Date(d)
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
}
export function fmtTime(t) { return t?.slice(0, 5) || '' }

export async function sendEmail({ to, subject, html }) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html })
    })
    if (!res.ok) console.error('Email hatası:', await res.text())
  } catch (e) {
    console.error('Email gönderilemedi:', e)
  }
}

export function emailYeniBaşvuru({ school_name, contact_name, contact_phone, contact_email, student_count, notes, date, start_time, end_time }) {
  return `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
  <h2 style="color:#0ea5e9;margin-top:0">📋 Yeni Ziyaret Başvurusu</h2>
  <p style="color:#334155">GZY Fen Lisesi'ne yeni bir ziyaret talebi geldi.</p>
  <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden">
    <tr style="background:#f1f5f9"><td style="padding:10px 14px;color:#64748b;font-size:13px">Okul</td><td style="padding:10px 14px;font-weight:600">${school_name}</td></tr>
    <tr><td style="padding:10px 14px;color:#64748b;font-size:13px">İlgili Kişi</td><td style="padding:10px 14px">${contact_name}</td></tr>
    <tr style="background:#f1f5f9"><td style="padding:10px 14px;color:#64748b;font-size:13px">Telefon</td><td style="padding:10px 14px">${contact_phone}</td></tr>
    <tr><td style="padding:10px 14px;color:#64748b;font-size:13px">E-posta</td><td style="padding:10px 14px">${contact_email || '–'}</td></tr>
    <tr style="background:#f1f5f9"><td style="padding:10px 14px;color:#64748b;font-size:13px">Öğrenci Sayısı</td><td style="padding:10px 14px;font-weight:700">${student_count} öğrenci</td></tr>
    <tr><td style="padding:10px 14px;color:#64748b;font-size:13px">Tarih</td><td style="padding:10px 14px;font-weight:700">${fmtDate(date)} · ${fmtTime(start_time)}–${fmtTime(end_time)}</td></tr>
    ${notes ? `<tr style="background:#f1f5f9"><td style="padding:10px 14px;color:#64748b;font-size:13px">Not</td><td style="padding:10px 14px">${notes}</td></tr>` : ''}
  </table>
  <p style="color:#94a3b8;font-size:12px;margin-top:20px">GZY Fen Lisesi Ziyaret Randevu Sistemi</p>
</div>`
}

export function emailTalepAlındı({ school_name, contact_name, student_count, date, start_time, end_time }) {
  return `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
  <h2 style="color:#10b981;margin-top:0">✅ Ziyaret Talebiniz Alındı</h2>
  <p style="color:#334155">Sayın <strong>${contact_name}</strong>, <strong>${school_name}</strong> adına yaptığınız ziyaret talebi alındı.</p>
  <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #10b981">
    <p style="margin:0;color:#64748b;font-size:13px">Talep edilen tarih</p>
    <p style="margin:4px 0 0;font-weight:700;font-size:16px">${fmtDate(date)}, ${fmtTime(start_time)}–${fmtTime(end_time)}</p>
    <p style="margin:4px 0 0;color:#64748b">${student_count} öğrenci</p>
  </div>
  <p style="color:#334155">Rehber öğretmenimiz talebinizi inceleyip en kısa sürede size dönüş yapacaktır.</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:20px">GZY Fen Lisesi – Samsun</p>
</div>`
}

export function emailOnaylandı({ contact_name, school_name, student_count, date, start_time, end_time }) {
  return `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
  <h2 style="color:#10b981;margin-top:0">🎉 Ziyaret Talebiniz Onaylandı!</h2>
  <p style="color:#334155">Sayın <strong>${contact_name}</strong>, <strong>${school_name}</strong> adına yaptığınız ziyaret talebi onaylanmıştır.</p>
  <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #10b981">
    <p style="margin:0;color:#64748b;font-size:13px">Onaylanan tarih</p>
    <p style="margin:4px 0 0;font-weight:700;font-size:16px">${fmtDate(date)}, ${fmtTime(start_time)}–${fmtTime(end_time)}</p>
    <p style="margin:4px 0 0;color:#64748b">${student_count} öğrenci</p>
  </div>
  <p style="color:#334155">Belirtilen tarihte GZY Fen Lisesi'nde sizi ağırlamaktan memnuniyet duyacağız.</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:20px">GZY Fen Lisesi – Samsun</p>
</div>`
}

export function emailİptalEdildi({ contact_name, school_name, date, start_time, end_time }) {
  return `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:12px">
  <h2 style="color:#ef4444;margin-top:0">❌ Ziyaret Talebiniz İptal Edildi</h2>
  <p style="color:#334155">Sayın <strong>${contact_name}</strong>, <strong>${school_name}</strong> adına yaptığınız aşağıdaki ziyaret talebi maalesef iptal edilmiştir.</p>
  <div style="background:#fff;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #ef4444">
    <p style="margin:0;font-weight:700">${fmtDate(date)}, ${fmtTime(start_time)}–${fmtTime(end_time)}</p>
  </div>
  <p style="color:#334155">Farklı bir tarih için yeniden başvurabilirsiniz.</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:20px">GZY Fen Lisesi – Samsun</p>
</div>`
}
