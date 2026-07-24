-- ============================================
-- ФОТО СООБЩЕНИЯ — Миграция
-- Политики как в старом проекте (открытые)
-- ============================================

-- Создаём бакет для фото (если нет)
INSERT INTO storage.buckets (id, name, public)
VALUES ('wintozo-photos', 'wintozo-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Политики — ОТКРЫТЫЕ (как в старом проекте)
DROP POLICY IF EXISTS "wintozo_photos_read" ON storage.objects;
CREATE POLICY "wintozo_photos_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'wintozo-photos');

DROP POLICY IF EXISTS "wintozo_photos_insert" ON storage.objects;
CREATE POLICY "wintozo_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'wintozo-photos');

DROP POLICY IF EXISTS "wintozo_photos_update" ON storage.objects;
CREATE POLICY "wintozo_photos_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'wintozo-photos');

DROP POLICY IF EXISTS "wintozo_photos_delete" ON storage.objects;
CREATE POLICY "wintozo_photos_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'wintozo-photos');
