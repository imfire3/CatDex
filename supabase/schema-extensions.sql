-- CatDex extended schema — run after schema.sql

alter table public.profiles
  add column if not exists xp integer not null default 0,
  add column if not exists level integer not null default 1,
  add column if not exists streak integer not null default 0,
  add column if not exists last_active_date date,
  add column if not exists avatar_emoji text default '🧢',
  add column if not exists total_captures integer not null default 0,
  add column if not exists zones_explored integer not null default 0;

create table if not exists public.badges (
  id text primary key,
  title text not null,
  description text not null,
  emoji text not null,
  criteria jsonb not null default '{}'
);

create table if not exists public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null references public.badges (id) on delete cascade,
  progress integer not null default 0,
  unlocked_at timestamptz,
  primary key (user_id, badge_id)
);

create table if not exists public.cat_photos (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  note text not null,
  weather text,
  observed_at timestamptz not null default now()
);

create table if not exists public.cat_favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  cat_id uuid not null references public.cats (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, cat_id)
);

create type public.friend_status as enum ('pending', 'accepted', 'declined');

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.friend_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create type public.notification_type as enum (
  'nearby_cat',
  'friend_discovery',
  'daily_streak',
  'friend_request'
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  payload jsonb not null default '{}',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists cat_photos_cat_id_idx on public.cat_photos (cat_id);
create index if not exists observations_cat_id_idx on public.observations (cat_id);
create index if not exists cat_favorites_user_id_idx on public.cat_favorites (user_id);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id);
create index if not exists notifications_user_id_idx on public.notifications (user_id);

alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.cat_photos enable row level security;
alter table public.observations enable row level security;
alter table public.cat_favorites enable row level security;
alter table public.friendships enable row level security;
alter table public.notifications enable row level security;

create policy "Badges are viewable by everyone" on public.badges for select using (true);
create policy "User badges viewable by everyone" on public.user_badges for select using (true);
create policy "Users manage own badges" on public.user_badges for all using (auth.uid() = user_id);
create policy "Cat photos viewable by everyone" on public.cat_photos for select using (true);
create policy "Users create cat photos" on public.cat_photos for insert with check (auth.uid() = user_id);
create policy "Observations viewable by everyone" on public.observations for select using (true);
create policy "Users create observations" on public.observations for insert with check (auth.uid() = user_id);
create policy "Favorites viewable by owner" on public.cat_favorites for select using (auth.uid() = user_id);
create policy "Users manage favorites" on public.cat_favorites for all using (auth.uid() = user_id);
create policy "Friendships viewable by participants" on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "Users create friend requests" on public.friendships for insert
  with check (auth.uid() = requester_id);
create policy "Participants update friendships" on public.friendships for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "Users view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);

insert into public.badges (id, title, description, emoji) values
  ('first_step', 'Premier Pas', 'Découvre ton premier chat', '🐾'),
  ('explorer', 'Explorateur', 'Visite 5 zones différentes', '🗺️'),
  ('collector', 'Collectionneur', 'Capture 20 chats uniques', '📚'),
  ('night_owl', 'Nuit Blanche', 'Observe un chat après minuit', '🌙'),
  ('legend', 'Légende Urbaine', 'Trouve un chat légendaire', '👑'),
  ('cat_friend', 'Ami des Chats', 'Ajoute 10 chats en favoris', '💖'),
  ('rainy', 'Météo', 'Observe sous la pluie', '🌧️'),
  ('social', 'Social', 'Ajoute 5 amis', '🤝')
on conflict (id) do nothing;

insert into public.zones (name, city, center_lat, center_lng, radius_meters) values
  ('Le Marais', 'Paris', 48.8568, 2.3622, 600),
  ('Bastille', 'Paris', 48.8532, 2.3698, 600),
  ('République', 'Paris', 48.8675, 2.3635, 600),
  ('Oberkampf', 'Paris', 48.8650, 2.3780, 600),
  ('Belleville', 'Paris', 48.8720, 2.3850, 600)
on conflict (name, city) do nothing;

create or replace function public.award_xp(p_user_id uuid, p_amount integer)
returns public.profiles
language plpgsql security definer set search_path = public
as $$
declare v_profile public.profiles;
begin
  update public.profiles
  set xp = xp + p_amount,
      level = greatest(1, floor((xp + p_amount) / 250) + 1),
      total_captures = total_captures + 1
  where id = p_user_id
  returning * into v_profile;
  return v_profile;
end;
$$;

grant execute on function public.award_xp to authenticated;
