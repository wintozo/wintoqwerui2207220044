-- ============================================
-- БИТВА СМАЙЛИКОВ + WINTOZO PRO
-- ============================================

-- 1. Счётчик дней активности
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS day_streak INTEGER DEFAULT 0;
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- 2. Команды битвы
CREATE TABLE IF NOT EXISTS wintozo_battle_teams (
  emoji TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO wintozo_battle_teams (emoji) VALUES
  ('😊'), ('😂'), ('❤️'), ('🔥'), ('👍'), ('🎉'), ('😎'), ('💎'), ('👑'), ('⚡'),
  ('🌟'), ('😍'), ('🤔'), ('😰'), ('🙏'), ('💪'), ('✅'), ('❌'), ('🚀'), ('💜'),
  ('🐶'), ('🐱'), ('🦊'), ('🐸'), ('🐹'), ('🐯'), ('🦄'), ('🐲'), ('🎮'), ('🎸'),
  ('🍕'), ('🍔'), ('🌮'), ('🍩'), ('🍪'), ('☕'), ('🌈'), ('⚽'), ('🏆'), ('💡')
ON CONFLICT (emoji) DO NOTHING;

-- 3. Кто за какой смайлик
CREATE TABLE IF NOT EXISTS wintozo_battle_users (
  username TEXT PRIMARY KEY REFERENCES wintozo_users(username) ON DELETE CASCADE,
  team_emoji TEXT NOT NULL REFERENCES wintozo_battle_teams(emoji) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Очки за неделю
CREATE TABLE IF NOT EXISTS wintozo_battle_scores (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL REFERENCES wintozo_users(username) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  text_score INTEGER DEFAULT 0,
  voice_score INTEGER DEFAULT 0,
  image_score INTEGER DEFAULT 0,
  login_bonus INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  multiplier INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(username, week_start)
);

-- 5. История побед
CREATE TABLE IF NOT EXISTS wintozo_battle_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  winning_emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pro-подписки
CREATE TABLE IF NOT EXISTS wintozo_pro (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL REFERENCES wintozo_users(username) ON DELETE CASCADE,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  reason TEXT DEFAULT '',
  UNIQUE(username)
);

-- 7. Цвет сообщений (Pro)
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS message_color TEXT DEFAULT '';
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS message_font TEXT DEFAULT '';
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS battle_multiplier DECIMAL(3,1) DEFAULT 1.0;
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS admin_contacts_remaining INTEGER DEFAULT 2;
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 7b. Бейджи победителей
CREATE TABLE IF NOT EXISTS wintozo_badges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL REFERENCES wintozo_users(username) ON DELETE CASCADE,
  badge_emoji TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  won_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(username, badge_emoji)
);

-- Добавляем колонку badge в пользователей
ALTER TABLE wintozo_users ADD COLUMN IF NOT EXISTS current_badge TEXT DEFAULT '';

UPDATE wintozo_users SET is_admin = true WHERE username = 'Admin';

-- 8. RLS
ALTER TABLE wintozo_battle_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE wintozo_battle_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wintozo_battle_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE wintozo_battle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wintozo_pro ENABLE ROW LEVEL SECURITY;
ALTER TABLE wintozo_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "battle_teams_read" ON wintozo_battle_teams;
DROP POLICY IF EXISTS "battle_teams_write" ON wintozo_battle_teams;
DROP POLICY IF EXISTS "battle_users_read" ON wintozo_battle_users;
DROP POLICY IF EXISTS "battle_users_write" ON wintozo_battle_users;
DROP POLICY IF EXISTS "battle_scores_read" ON wintozo_battle_scores;
DROP POLICY IF EXISTS "battle_scores_write" ON wintozo_battle_scores;
DROP POLICY IF EXISTS "battle_history_read" ON wintozo_battle_history;
DROP POLICY IF EXISTS "pro_read" ON wintozo_pro;
DROP POLICY IF EXISTS "pro_write" ON wintozo_pro;

CREATE POLICY "battle_teams_read"  ON wintozo_battle_teams  FOR SELECT USING (true);
CREATE POLICY "battle_teams_write" ON wintozo_battle_teams  FOR INSERT WITH CHECK (true);
CREATE POLICY "battle_users_read"  ON wintozo_battle_users  FOR SELECT USING (true);
CREATE POLICY "battle_users_write" ON wintozo_battle_users  FOR ALL USING (true);
CREATE POLICY "battle_scores_read"  ON wintozo_battle_scores FOR SELECT USING (true);
CREATE POLICY "battle_scores_write" ON wintozo_battle_scores FOR ALL USING (true);
CREATE POLICY "battle_history_read" ON wintozo_battle_history FOR SELECT USING (true);
CREATE POLICY "pro_read"  ON wintozo_pro FOR SELECT USING (true);
CREATE POLICY "pro_write" ON wintozo_pro FOR ALL USING (true);
CREATE POLICY "badges_read" ON wintozo_badges FOR SELECT USING (true);
CREATE POLICY "badges_write" ON wintozo_badges FOR ALL USING (true);

-- ============================================
-- ФУНКЦИИ
-- ============================================

-- Получить понедельник текущей недели
CREATE OR REPLACE FUNCTION get_week_start() RETURNS DATE AS $$
  SELECT DATE_TRUNC('week', CURRENT_DATE)::DATE;
$$ LANGUAGE SQL IMMUTABLE;

-- Добавить очки за сообщение
CREATE OR REPLACE FUNCTION add_message_points(
  p_username TEXT,
  p_message_type TEXT
) RETURNS void AS $$
DECLARE
  v_week DATE;
  v_mult INTEGER := 1;
  v_team TEXT;
  v_points INTEGER;
  v_pro_end TIMESTAMPTZ;
BEGIN
  v_week := get_week_start();

  SELECT end_date INTO v_pro_end FROM wintozo_pro WHERE username = p_username;
  IF v_pro_end IS NOT NULL AND v_pro_end > NOW() THEN
    v_mult := 2;
  END IF;

  IF p_message_type = 'text' THEN
    v_points := 1;
  ELSIF p_message_type = 'voice' THEN
    v_points := 2;
  ELSIF p_message_type = 'image' THEN
    v_points := 5;
  ELSE
    v_points := 0;
  END IF;

  SELECT team_emoji INTO v_team FROM wintozo_battle_users WHERE username = p_username;
  IF v_team IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO wintozo_battle_scores (username, week_start, text_score, voice_score, image_score, total_score, multiplier)
  VALUES (p_username, v_week,
    CASE WHEN p_message_type = 'text' THEN v_points ELSE 0 END,
    CASE WHEN p_message_type = 'voice' THEN v_points ELSE 0 END,
    CASE WHEN p_message_type = 'image' THEN v_points ELSE 0 END,
    v_points * v_mult,
    v_mult
  )
  ON CONFLICT (username, week_start) DO UPDATE SET
    text_score = wintozo_battle_scores.text_score + CASE WHEN p_message_type = 'text' THEN v_points ELSE 0 END,
    voice_score = wintozo_battle_scores.voice_score + CASE WHEN p_message_type = 'voice' THEN v_points ELSE 0 END,
    image_score = wintozo_battle_scores.image_score + CASE WHEN p_message_type = 'image' THEN v_points ELSE 0 END,
    total_score = wintozo_battle_scores.total_score + v_points * v_mult,
    multiplier = v_mult;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ежедневный вход (10 очков, streak → Pro)
CREATE OR REPLACE FUNCTION claim_daily_login(p_username TEXT) RETURNS jsonb AS $$
DECLARE
  v_week DATE;
  v_today DATE := CURRENT_DATE;
  v_last_login DATE;
  v_streak INTEGER;
  v_team TEXT;
  v_mult INTEGER := 1;
  v_pro_end TIMESTAMPTZ;
BEGIN
  v_week := get_week_start();

  SELECT last_login_date, day_streak INTO v_last_login, v_streak
  FROM wintozo_users WHERE username = p_username;

  IF v_last_login = v_today THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_today');
  END IF;

  IF v_last_login = v_today - 1 THEN
    v_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_streak := 1;
  END IF;

  UPDATE wintozo_users
  SET last_login_date = v_today, day_streak = v_streak
  WHERE username = p_username;

  SELECT end_date INTO v_pro_end FROM wintozo_pro WHERE username = p_username;
  IF v_pro_end IS NOT NULL AND v_pro_end > NOW() THEN
    v_mult := 2;
  END IF;

  SELECT team_emoji INTO v_team FROM wintozo_battle_users WHERE username = p_username;
  IF v_team IS NOT NULL THEN
    INSERT INTO wintozo_battle_scores (username, week_start, login_bonus, total_score, multiplier)
    VALUES (p_username, v_week, 10, 10 * v_mult, v_mult)
    ON CONFLICT (username, week_start) DO UPDATE SET
      login_bonus = wintozo_battle_scores.login_bonus + 10,
      total_score = wintozo_battle_scores.total_score + 10 * v_mult,
      multiplier = v_mult;
  END IF;

  IF v_streak >= 15 AND (v_streak % 15 = 0 OR v_streak = 15) THEN
    INSERT INTO wintozo_pro (username, end_date, reason)
    VALUES (p_username, NOW() + INTERVAL '10 days', 'streak')
    ON CONFLICT (username) DO UPDATE SET
      end_date = GREATEST(COALESCE(wintozo_pro.end_date, '1970-01-01'::TIMESTAMPTZ), NOW() + INTERVAL '10 days'),
      reason = 'streak';
  END IF;

  RETURN jsonb_build_object('claimed', true, 'streak', v_streak, 'mult', v_mult);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Выбрать/сменить команду
CREATE OR REPLACE FUNCTION join_battle_team(p_username TEXT, p_emoji TEXT) RETURNS jsonb AS $$
DECLARE
  v_exists TEXT;
BEGIN
  SELECT emoji INTO v_exists FROM wintozo_battle_teams WHERE emoji = p_emoji;
  IF v_exists IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'team_not_found');
  END IF;

  INSERT INTO wintozo_battle_users (username, team_emoji)
  VALUES (p_username, p_emoji)
  ON CONFLICT (username) DO UPDATE SET team_emoji = p_emoji, joined_at = NOW();

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Рейтинг команд
CREATE OR REPLACE FUNCTION get_battle_standings() RETURNS TABLE(
  emoji TEXT,
  total_points BIGINT,
  member_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bu.team_emoji,
    COALESCE(SUM(bs.total_score), 0)::BIGINT,
    COUNT(DISTINCT bu.username)::BIGINT
  FROM wintozo_battle_users bu
  LEFT JOIN wintozo_battle_scores bs ON
    bs.username = bu.username AND bs.week_start = get_week_start()
  GROUP BY bu.team_emoji
  ORDER BY total_points DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Топ пользователей в команде
CREATE OR REPLACE FUNCTION get_team_top(p_emoji TEXT) RETURNS TABLE(
  username TEXT,
  total_score INTEGER,
  multiplier INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bu.username,
    COALESCE(bs.total_score, 0),
    COALESCE(bs.multiplier, 1)
  FROM wintozo_battle_users bu
  LEFT JOIN wintozo_battle_scores bs ON
    bs.username = bu.username AND bs.week_start = get_week_start()
  WHERE bu.team_emoji = p_emoji
  ORDER BY COALESCE(bs.total_score, 0) DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Подвести итоги недели
CREATE OR REPLACE FUNCTION settle_battle_week() RETURNS jsonb AS $$
DECLARE
  v_last_week DATE := get_week_start() - INTERVAL '7 days';
  v_last_end DATE := get_week_start() - INTERVAL '1 day';
  v_winner TEXT;
  v_already BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM wintozo_battle_history WHERE week_start = v_last_week) INTO v_already;
  IF v_already THEN
    RETURN jsonb_build_object('settled', false, 'reason', 'already');
  END IF;

  SELECT emoji INTO v_winner FROM (
    SELECT bu.team_emoji AS emoji, SUM(bs.total_score) AS total
    FROM wintozo_battle_users bu
    JOIN wintozo_battle_scores bs ON bs.username = bu.username AND bs.week_start = v_last_week
    GROUP BY bu.team_emoji
    ORDER BY total DESC
    LIMIT 1
  ) sub;

  IF v_winner IS NULL THEN
    RETURN jsonb_build_object('settled', false, 'reason', 'no_scores');
  END IF;

  INSERT INTO wintozo_battle_history (week_start, week_end, winning_emoji)
  VALUES (v_last_week, v_last_end, v_winner);

  INSERT INTO wintozo_pro (username, end_date, reason)
  SELECT bu.username, NOW() + INTERVAL '3 days', 'battle'
  FROM wintozo_battle_users bu
  WHERE bu.team_emoji = v_winner
  ON CONFLICT (username) DO UPDATE SET
    end_date = GREATEST(wintozo_pro.end_date, NOW() + INTERVAL '3 days'),
    reason = 'battle';

  -- Выдаём бейдж победителя всем участникам команды
  INSERT INTO wintozo_badges (username, badge_emoji, badge_name)
  SELECT bu.username, v_winner, 'Победитель: ' || v_winner
  FROM wintozo_battle_users bu
  WHERE bu.team_emoji = v_winner
  ON CONFLICT (username, badge_emoji) DO UPDATE SET
    won_at = NOW();

  -- Устанавливаем текущий бейдж победителя
  UPDATE wintozo_users u
  SET current_badge = v_winner
  FROM wintozo_battle_users bu
  WHERE u.username = bu.username AND bu.team_emoji = v_winner;

  DELETE FROM wintozo_battle_scores WHERE week_start < get_week_start();

  RETURN jsonb_build_object('settled', true, 'winner', v_winner);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Админ Pro навсегда
CREATE OR REPLACE FUNCTION ensure_admin_pro() RETURNS void AS $$
BEGIN
  -- Создаём пользователя Admin, если нет
  INSERT INTO wintozo_users (username, nickname, password_hash, is_admin)
  VALUES ('Admin', 'Admin', 'dummy', true)
  ON CONFLICT (username) DO UPDATE SET
    is_admin = true
  WHERE wintozo_users.is_admin IS NOT true;

  -- Даём Pro
  INSERT INTO wintozo_pro (username, end_date, reason)
  VALUES ('Admin', NULL, 'admin')
  ON CONFLICT (username) DO UPDATE SET
    end_date = NULL,
    reason = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT ensure_admin_pro();

-- Pro-статус пользователя
CREATE OR REPLACE FUNCTION get_pro_status(p_username TEXT) RETURNS jsonb AS $$
DECLARE
  v_pro_end TIMESTAMPTZ;
  v_reason TEXT;
  v_message_color TEXT;
  v_admin_contacts INTEGER;
BEGIN
  SELECT end_date, reason INTO v_pro_end, v_reason
  FROM wintozo_pro WHERE username = p_username;

  IF p_username = 'Admin' THEN
    SELECT message_color INTO v_message_color FROM wintozo_users WHERE username = p_username;
    SELECT admin_contacts_remaining INTO v_admin_contacts FROM wintozo_users WHERE username = p_username;
    RETURN jsonb_build_object(
      'active', true, 'reason', 'admin', 'end_date', null,
      'message_color', COALESCE(v_message_color, ''),
      'admin_contacts', COALESCE(v_admin_contacts, 2)
    );
  END IF;

  IF v_pro_end IS NULL OR v_pro_end <= NOW() THEN
    RETURN jsonb_build_object('active', false);
  END IF;

  SELECT message_color INTO v_message_color FROM wintozo_users WHERE username = p_username;
  SELECT admin_contacts_remaining INTO v_admin_contacts FROM wintozo_users WHERE username = p_username;

  RETURN jsonb_build_object(
    'active', true,
    'reason', v_reason,
    'end_date', v_pro_end,
    'message_color', COALESCE(v_message_color, ''),
    'admin_contacts', COALESCE(v_admin_contacts, 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Получить бейджи пользователя
CREATE OR REPLACE FUNCTION get_user_badges(p_username TEXT) RETURNS TABLE(
  badge_emoji TEXT,
  badge_name TEXT,
  won_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT badge_emoji, badge_name, won_at
  FROM wintozo_badges
  WHERE username = p_username
  ORDER BY won_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Дать Pro (только админ)
CREATE OR REPLACE FUNCTION grant_pro(
  p_target_username TEXT,
  p_days INTEGER,
  p_admin_username TEXT,
  p_reason TEXT DEFAULT 'admin'
) RETURNS void AS $$
DECLARE
  v_days INTEGER;
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin FROM wintozo_users WHERE username = p_admin_username;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Только админ может выдавать Pro';
  END IF;

  v_days := COALESCE(p_days, -1);

  INSERT INTO wintozo_pro (username, end_date, reason)
  VALUES (
    p_target_username,
    CASE WHEN v_days = -1 THEN NULL ELSE NOW() + (v_days || ' days')::INTERVAL END,
    COALESCE(p_reason, 'admin')
  )
  ON CONFLICT (username) DO UPDATE SET
    end_date = CASE WHEN v_days = -1 THEN NULL ELSE GREATEST(COALESCE(wintozo_pro.end_date, '1970-01-01'::TIMESTAMPTZ), NOW() + (v_days || ' days')::INTERVAL) END,
    reason = COALESCE(p_reason, 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Забрать Pro (только админ)
CREATE OR REPLACE FUNCTION revoke_pro(p_target_username TEXT, p_admin_username TEXT) RETURNS void AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin FROM wintozo_users WHERE username = p_admin_username;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Только админ может забирать Pro';
  END IF;

  DELETE FROM wintozo_pro WHERE username = p_target_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_wintozo_pro_username ON wintozo_pro(username);
CREATE INDEX IF NOT EXISTS idx_wintozo_pro_end_date ON wintozo_pro(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wintozo_battle_users_username ON wintozo_battle_users(username);
CREATE INDEX IF NOT EXISTS idx_wintozo_battle_users_team ON wintozo_battle_users(team_emoji);
CREATE INDEX IF NOT EXISTS idx_wintozo_battle_scores_username_week ON wintozo_battle_scores(username, week_start);
CREATE INDEX IF NOT EXISTS idx_wintozo_battle_history_week_start ON wintozo_battle_history(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_wintozo_badges_username ON wintozo_badges(username);
CREATE INDEX IF NOT EXISTS idx_wintozo_badges_badge ON wintozo_badges(badge_emoji);

ANALYZE wintozo_pro;
ANALYZE wintozo_battle_users;
ANALYZE wintozo_battle_scores;
ANALYZE wintozo_battle_history;
ANALYZE wintozo_badges;
