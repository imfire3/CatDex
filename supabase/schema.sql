-- Idempotent helpers for re-runs
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  avatar_emoji text default '😺',
  onboarding_completed boolean not null default false,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  last_active_date date,
  total_captures integer not null default 0,
  zones_explored integer not null default 0,
  created_at timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 24),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]+$')
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  center_lat double precision not null,
  center_lng double precision not null,
  radius_meters integer not null default 600,
  created_at timestamptz not null default now(),
  constraint zones_name_city_key unique (name, city)
);

create table if not exists public.cats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  zone_id uuid not null references public.zones (id) on delete restrict,
  color text,
  breed text,
  pattern text,
  photo_url text not null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  dedup_key text not null unique,
  lat_approx double precision not null,
  lng_approx double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cat_id uuid not null references public.cats (id) on delete cascade,
  photo_url text,
  captured_at timestamptz not null default now(),
  unique (user_id, cat_id)
);

create index if not exists cats_zone_id_idx on public.cats (zone_id);
create index if not exists captures_user_id_idx on public.captures (user_id);
create index if not exists captures_cat_id_idx on public.captures (cat_id);

alter table public.profiles enable row level security;
alter table public.zones enable row level security;
alter table public.cats enable row level security;
alter table public.captures enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Zones are viewable by everyone" on public.zones;
drop policy if exists "Cats are viewable by everyone" on public.cats;
drop policy if exists "Authenticated users can create cats" on public.cats;
drop policy if exists "Captures are viewable by everyone" on public.captures;
drop policy if exists "Users can create their own captures" on public.captures;
drop policy if exists "Users can delete their own captures" on public.captures;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Zones are viewable by everyone"
  on public.zones for select using (true);

create policy "Cats are viewable by everyone"
  on public.cats for select using (true);

create policy "Authenticated users can create cats"
  on public.cats for insert with check (auth.uid() = created_by);

create policy "Captures are viewable by everyone"
  on public.captures for select using (true);

create policy "Users can create their own captures"
  on public.captures for insert with check (auth.uid() = user_id);

create policy "Users can delete their own captures"
  on public.captures for delete using (auth.uid() = user_id);

insert into public.zones (name, city, center_lat, center_lng, radius_meters) values
  ('Shibuya', 'Tokyo', 35.6595, 139.7004, 700),
  ('Shinjuku', 'Tokyo', 35.6938, 139.7034, 700),
  ('Asakusa', 'Tokyo', 35.7148, 139.7967, 600),
  ('Ginza', 'Tokyo', 35.6717, 139.7649, 500),
  ('Akihabara', 'Tokyo', 35.7023, 139.7745, 500),
  ('Harajuku', 'Tokyo', 35.6702, 139.7027, 500),
  ('Roppongi', 'Tokyo', 35.6628, 139.7312, 600),
  ('Ueno', 'Tokyo', 35.7141, 139.7774, 600),
  ('Le Marais', 'Paris', 48.8566, 2.3622, 600),
  ('Bastille', 'Paris', 48.8530, 2.3690, 600),
  ('Belleville', 'Paris', 48.8720, 2.3765, 700),
  ('Père-Lachaise', 'Paris', 48.8610, 2.3934, 550),
  ('République', 'Paris', 48.8676, 2.3636, 500),
  ('Ménilmontant', 'Paris', 48.8665, 2.3885, 550)
on conflict (name, city) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Skip email confirmation friction: users can sign in right after signup.
  update auth.users
  set
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    confirmed_at = coalesce(confirmed_at, now())
  where id = new.id;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.create_cat_with_capture(
  p_name text,
  p_zone_id uuid,
  p_color text,
  p_breed text,
  p_pattern text,
  p_photo_url text,
  p_dedup_key text,
  p_lat_approx double precision,
  p_lng_approx double precision
)
returns public.cats
language plpgsql
security definer set search_path = public
as $$
declare
  v_cat public.cats;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_cat from public.cats where dedup_key = p_dedup_key;
  if found then
    raise exception 'Cat already exists in this zone' using errcode = '23505';
  end if;

  insert into public.cats (
    name, zone_id, color, breed, pattern, photo_url, created_by,
    dedup_key, lat_approx, lng_approx
  ) values (
    p_name, p_zone_id, p_color, p_breed, p_pattern, p_photo_url, auth.uid(),
    p_dedup_key, p_lat_approx, p_lng_approx
  ) returning * into v_cat;

  insert into public.captures (user_id, cat_id, photo_url)
  values (auth.uid(), v_cat.id, p_photo_url)
  on conflict (user_id, cat_id) do nothing;

  return v_cat;
end;
$$;

grant execute on function public.create_cat_with_capture to authenticated;
