import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/*
======================================================
SUPABASE SQL EDITOR'A YAPISTIR VE RUN ET
(Eğer tablolar zaten varsa önce DROP edip tekrar çalıştır)
======================================================

-- Ziyaret slotları
CREATE TABLE IF NOT EXISTS visit_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INT NOT NULL,
  current_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ziyaret başvuruları
CREATE TABLE IF NOT EXISTS visit_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID REFERENCES visit_slots(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  student_count INT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'beklemede',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE visit_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_bookings ENABLE ROW LEVEL SECURITY;

-- Slotlar herkese açık (okuma)
CREATE POLICY "Slotlar herkese acik" ON visit_slots FOR SELECT USING (true);
CREATE POLICY "Admin slot ekleyebilir" ON visit_slots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin slot silebilir" ON visit_slots FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin slot guncelleyebilir" ON visit_slots FOR UPDATE USING (auth.role() = 'authenticated');

-- Başvurular
CREATE POLICY "Herkes basvurabilir" ON visit_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin basvurulari gorebilir" ON visit_bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin basvuru guncelleyebilir" ON visit_bookings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin basvuru silebilir" ON visit_bookings FOR DELETE USING (auth.role() = 'authenticated');

-- Slot sayacı trigger (SECURITY DEFINER = RLS'i bypass eder, anonim kullanıcılar için gerekli)
CREATE OR REPLACE FUNCTION update_slot_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE visit_slots SET current_count = current_count + NEW.student_count WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE visit_slots SET current_count = current_count - OLD.student_count WHERE id = OLD.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS booking_count_trigger ON visit_bookings;
CREATE TRIGGER booking_count_trigger
AFTER INSERT OR DELETE ON visit_bookings
FOR EACH ROW EXECUTE FUNCTION update_slot_count();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE visit_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE visit_bookings;

======================================================
ADMİN ŞİFRESİ SIFIRLAMA (Giriş yapılamıyorsa bu SQL'i çalıştır)
Supabase → Authentication → Users → kullanıcıyı sil → yeniden oluştur (Dashboard üzerinden).
Ya da aşağıdaki SQL ile sıfırla (extensions şeması gerekiyor):

UPDATE auth.users
SET encrypted_password = extensions.crypt('YENİ_ŞİFRE', extensions.gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'EMAIL_ADRESİ';

Eğer extensions.crypt çalışmazsa Supabase Dashboard'dan kullanıcıyı silip
Authentication > Users > Add user ile yeniden oluştur — bu en güvenilir yol.
======================================================
*/
