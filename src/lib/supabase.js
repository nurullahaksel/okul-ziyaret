import { createClient } from '@supabase/supabase-js'

// .env dosyasından veya direkt buraya yaz
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/*
======================================================
SUPABASE'DE ÇALIŞTIRILACAK SQL (Table Editor > SQL)
======================================================

-- Ziyaret slotları (admin tarafından oluşturulan)
CREATE TABLE visit_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INT NOT NULL,
  current_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ziyaret başvuruları (diğer okullardan)
CREATE TABLE visit_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID REFERENCES visit_slots(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  student_count INT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'beklemede', -- beklemede | onaylandi | iptal
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS politikaları (Row Level Security)
ALTER TABLE visit_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_bookings ENABLE ROW LEVEL SECURITY;

-- Slotları herkes görebilir
CREATE POLICY "Slotlar herkese acik" ON visit_slots FOR SELECT USING (true);

-- Slotları sadece admin (authenticated) oluşturabilir/silebilir
CREATE POLICY "Admin slot ekleyebilir" ON visit_slots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin slot silebilir" ON visit_slots FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin slot guncelleyebilir" ON visit_slots FOR UPDATE USING (auth.role() = 'authenticated');

-- Başvuruları herkes yapabilir
CREATE POLICY "Herkes basvurabilir" ON visit_bookings FOR INSERT WITH CHECK (true);

-- Başvuruları sadece admin görebilir
CREATE POLICY "Admin basvurulari gorebilir" ON visit_bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin basvuru guncelleyebilir" ON visit_bookings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin basvuru silebilir" ON visit_bookings FOR DELETE USING (auth.role() = 'authenticated');

-- Slot sayacını güncelleyen fonksiyon
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_count_trigger
AFTER INSERT OR DELETE ON visit_bookings
FOR EACH ROW EXECUTE FUNCTION update_slot_count();

-- Realtime için tabloları etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE visit_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE visit_bookings;
======================================================
*/
