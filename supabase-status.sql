-- Удалить все сообщения
DELETE FROM messages;

-- Таблица статусов пользователей
create table if not exists users_status (
  username text primary key,
  status text not null default 'offline',
  last_seen timestamptz default now(),
  is_typing boolean default false,
  updated_at timestamptz default now()
);

-- Публикация для realtime
alter publication supabase_realtime add table users_status;

-- RLS для статусов
alter table users_status enable row level security;

drop policy if exists "public_status_read" on users_status;
create policy "public_status_read" on users_status for select using (true);

drop policy if exists "public_status_update" on users_status;
create policy "public_status_update" on users_status for insert with check (true);
