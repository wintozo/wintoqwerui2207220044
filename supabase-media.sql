-- ============================================
-- ГОЛОСОВЫЕ И ФОТО СООБЩЕНИЯ — Миграция
-- Политики как в старом проекте (открытые)
-- ============================================

-- 1. Создаём бакет для медиа (голосовые + фото)
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-media', 'message-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Политики — ОТКРЫТЫЕ (как в старом проекте wintozo-voice)
-- Чтение: все
DROP POLICY IF EXISTS "message_media_read" ON storage.objects;
CREATE POLICY "message_media_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'message-media');

-- Загрузка: все (без проверки auth)
DROP POLICY IF EXISTS "message_media_upload" ON storage.objects;
CREATE POLICY "message_media_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'message-media');

-- Обновление: все
DROP POLICY IF EXISTS "message_media_update" ON storage.objects;
CREATE POLICY "message_media_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'message-media');

-- Удаление: все
DROP POLICY IF EXISTS "message_media_delete" ON storage.objects;
CREATE POLICY "message_media_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'message-media');
