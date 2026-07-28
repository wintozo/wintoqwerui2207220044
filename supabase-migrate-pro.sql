-- SQL для создания колонок Pro-настроек
-- Выполнить в Supabase SQL Editor

ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS message_color TEXT DEFAULT '';
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS message_font TEXT DEFAULT '';
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS battle_multiplier DECIMAL(3,1) DEFAULT 1.0;

-- Обновить текущего админа
UPDATE wintozo_users SET 
  message_color = '#3b82f6', 
  message_font = 'system-ui, -apple-system, sans-serif', 
  battle_multiplier = 1.0 
WHERE username = 'admin';
