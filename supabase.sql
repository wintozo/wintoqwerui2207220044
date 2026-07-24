
create extension if not exists pgcrypto;

create table if not exists wintozo_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  nickname text not null,
  password_hash text not null,
  avatar text default '',
  avatar_url text default '',
  description text default '',
  banned boolean default false,
  created_at timestamptz default now()
);

create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

create table if not exists chat_participants (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  username text not null,
  created_at timestamptz default now(),
  unique(chat_id, username)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade,
  sender_username text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table wintozo_users enable row level security;
alter table chats enable row level security;
alter table chat_participants enable row level security;
alter table messages enable row level security;

drop policy if exists "public_read_users" on wintozo_users;
create policy "public_read_users" on wintozo_users for select using (true);

drop policy if exists "public_insert_users" on wintozo_users;
create policy "public_insert_users" on wintozo_users for insert with check (true);

drop policy if exists "public_update_users" on wintozo_users;
create policy "public_update_users" on wintozo_users for update using (true) with check (true);

drop policy if exists "public_chats" on chats;
create policy "public_chats" on chats for select using (true);
create policy "public_chats_insert" on chats for insert with check (true);

drop policy if exists "public_chat_participants" on chat_participants;
create policy "public_chat_participants" on chat_participants for select using (true);
create policy "public_chat_participants_insert" on chat_participants for insert with check (true);

drop policy if exists "public_messages" on messages;
create policy "public_messages" on messages for select using (true);
create policy "public_messages_insert" on messages for insert with check (true);

create or replace function find_or_create_chat(user_a text, user_b text)
returns uuid as $$
declare
  chat_id uuid;
begin
  select cp1.chat_id into chat_id
  from chat_participants cp1
  join chat_participants cp2 on cp1.chat_id = cp2.chat_id
  where cp1.username = user_a and cp2.username = user_b
  limit 1;

  if chat_id is not null then
    return chat_id;
  end if;

  insert into chats (id) values (gen_random_uuid()) returning id into chat_id;

  insert into chat_participants (chat_id, username) values (chat_id, user_a);
  insert into chat_participants (chat_id, username) values (chat_id, user_b);

  return chat_id;
end;
$$ language plpgsql security definer;

drop publication if exists supabase_realtime;
create publication supabase_realtime for table messages, chat_participants;
