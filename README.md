# 🏫 GZY Fen Lisesi – Ziyaret Randevu Sistemi

Samsun Garip Zeycan Yıldırım Fen Lisesi için geliştirilmiş okul ziyaret randevu sistemi.

## Özellikler
- Rehber öğretmen giriş paneli (e-posta + şifre)
- Ziyaret günü / saat aralığı / kontenjan belirleme
- Birden fazla okul aynı slota kayıt olabilir (toplam kontenjan aşılmaz)
- Anlık öğrenci sayısı takibi (Realtime)
- Başvuru onaylama / iptal etme
- Tamamen ücretsiz altyapı (Supabase + Vercel)

---

## 🚀 Kurulum (Adım Adım)

### 1. Supabase Projesi Oluştur
1. [supabase.com](https://supabase.com) → "Start for free" → GitHub ile giriş yap
2. "New project" → İsim: `okul-ziyaret` → Şifre belirle → Region: **Europe West (Frankfurt)**
3. Proje hazır olana kadar bekle (~1 dakika)

### 2. Veritabanı Tablolarını Oluştur
1. Sol menü → **SQL Editor** → "New query"
2. `src/lib/supabase.js` dosyasının içindeki SQL kodunu kopyala (/* ... */ arasındaki kısım)
3. **Run** butonuna bas

### 3. Admin Kullanıcısını Oluştur
1. Sol menü → **Authentication** → **Users** → "Add user"
2. E-posta: `rehber@gzy.edu.tr` (istediğin bir e-posta)
3. Şifre: güçlü bir şifre belirle
4. "Create user" → Kaydet

### 4. Supabase Anahtarlarını Al
1. Sol menü → **Project Settings** → **API**
2. Kopyala:
   - `Project URL` → VITE_SUPABASE_URL
   - `anon public` key → VITE_SUPABASE_ANON_KEY

### 5. .env Dosyasını Oluştur
Proje klasöründe `.env` dosyası oluştur:
```
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxx...
```

### 6. Yerel Ortamda Test Et
```bash
npm install
npm run dev
```
http://localhost:5173 adresini aç.

---

## 🌐 Vercel'e Deploy Et (Ücretsiz Yayın)

### Yöntem A: GitHub üzerinden (Önerilen)
1. Kodu GitHub'a push et (private repo olabilir)
2. [vercel.com](https://vercel.com) → "New Project" → GitHub repo seç
3. **Environment Variables** bölümüne `.env` içindeki değerleri gir
4. "Deploy" → 2 dakikada site canlıya alınır!

### Yöntem B: Vercel CLI
```bash
npm i -g vercel
vercel
# Soruları yanıtla, env değerlerini gir
```

---

## 📱 Kullanım

### Rehber Öğretmen
1. `siteniz.vercel.app` → **Rehber Öğretmen** kartına tıkla
2. E-posta + şifre ile giriş yap
3. **Ziyaret Slotları** → "+ Yeni Ziyaret Günü Ekle"
4. Tarih, saat aralığı ve maksimum öğrenci sayısını belirle
5. Başvuruları "Başvurular" sekmesinden takip et, onayla veya iptal et

### Diğer Okullar
1. `siteniz.vercel.app` → **Ziyaret Talep Et** kartına tıkla
2. Uygun tarihi seç → Okul bilgilerini doldur
3. Öğrenci sayısını gir (kalan kontenjan kadar)
4. Talebi gönder → Onay için rehber öğretmeni bekle

---

## 🔧 Teknik Altyapı
- **Frontend:** React + Vite
- **Backend/DB:** Supabase (PostgreSQL + Realtime + Auth)
- **Hosting:** Vercel (ücretsiz)
- **Realtime:** Supabase WebSocket → anlık kontenjan güncellemesi

## 💰 Maliyet
**Tamamen ücretsiz!**
- Supabase Free: 500MB DB, 2GB transfer/ay, Realtime dahil
- Vercel Free: sınırsız deploy, custom domain dahil
