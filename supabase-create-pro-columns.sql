-- Создаём функцию для добавления колонок Pro-настроек
CREATE OR REPLACE FUNCTION create_pro_columns()
RETURNS void AS $$
BEGIN
  -- Добавляем колонки если их нет
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wintozo_users' AND column_name = 'message_color') THEN
    ALTER TABLE wintozo_users ADD COLUMN message_color TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wintozo_users' AND column_name = 'message_font') THEN
    ALTER TABLE wintozo_users ADD COLUMN message_font TEXT DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wintozo_users' AND column_name = 'battle_multiplier') THEN
    ALTER TABLE wintozo_users ADD COLUMN battle_multiplier DECIMAL(3,1) DEFAULT 1.0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Вызываем функцию
SELECT create_pro_columns();

-- Обновляем текущего админа
UPDATE wintozo_users SET 
  message_color = '#3b82f6', 
  message_font = 'system-ui, -apple-system, sans-serif', 
  battle_multiplier = 1.0 
WHERE username = 'admin';
