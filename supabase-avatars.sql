-- ============================================
-- АВATARКИ ПРОФИЛЯ — Миграция
-- ============================================

-- 1. Создаём бакет для аватарок
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Политики — ОТКРЫТЫЕ
-- Чтение: все
DROP POLICY IF EXISTS "avatars_read" ON storage.objects;
CREATE POLICY "avatars_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Загрузка: все
DROP POLICY IF EXISTS "avatars_insert" ON storage.objects;
CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Обновление: все
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars');

-- Удаление: все
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');

-- 3. Предустановленные аватарки (SVG emoji-стиль)
-- Можно заменить на реальные URL изображений
UPDATE wintozo_users 
SET avatar_url = ''
WHERE avatar_url IS NULL;
