-- CatDex gameplay schema — run after schema-extensions.sql

alter table public.cats
  add column if not exists model_id text not null default 'tabby_short',
  add column if not exists estimated_age text,
  add column if not exists fur_length text,
  add column if not exists rarity text not null default 'commun',
  add column if not exists sighting_count integer not null default 1,
  add column if not exists last_observed_at timestamptz not null default now();

alter table public.profiles
  add column if not exists unlocked_frames text[] not null default '{}',
  add column if not exists unlocked_backgrounds text[] not null default '{}';

create table if not exists public.cat_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  cat_id uuid not null references public.cats (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, cat_id)
);

create table if not exists public.cat_comments (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references public.cats (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists cat_likes_cat_id_idx on public.cat_likes (cat_id);
create index if not exists cat_comments_cat_id_idx on public.cat_comments (cat_id);

alter table public.cat_likes enable row level security;
alter table public.cat_comments enable row level security;

create policy "Cat likes viewable by everyone" on public.cat_likes for select using (true);
create policy "Users manage own likes" on public.cat_likes for all using (auth.uid() = user_id);
create policy "Cat comments viewable by everyone" on public.cat_comments for select using (true);
create policy "Users create comments" on public.cat_comments for insert with check (auth.uid() = user_id);

insert into public.badges (id, title, description, emoji) values
  ('photographer', 'Photographe', 'Prends 25 photos de chats', '📸'),
  ('night_explorer', 'Night Explorer', 'Observe un chat après minuit', '🌙'),
  ('cats_100', '100 Chats', 'Documente 100 chats', '💯'),
  ('cats_500', '500 Chats', 'Documente 500 chats', '🏆'),
  ('cats_1000', '1000 Chats', 'Documente 1000 chats', '👑'),
  ('streak_7', 'Série de feu', '7 jours d''affilée', '🔥')
on conflict (id) do nothing;

create or replace function public.create_cat_with_capture(
  p_name text,
  p_zone_id uuid,
  p_color text,
  p_breed text,
  p_pattern text,
  p_photo_url text,
  p_dedup_key text,
  p_lat_approx double precision,
  p_lng_approx double precision,
  p_model_id text default 'tabby_short',
  p_estimated_age text default null,
  p_fur_length text default null,
  p_rarity text default 'commun'
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
    dedup_key, lat_approx, lng_approx, model_id, estimated_age, fur_length, rarity
  ) values (
    p_name, p_zone_id, p_color, p_breed, p_pattern, p_photo_url, auth.uid(),
    p_dedup_key, p_lat_approx, p_lng_approx, p_model_id, p_estimated_age, p_fur_length, p_rarity
  ) returning * into v_cat;

  insert into public.captures (user_id, cat_id, photo_url)
  values (auth.uid(), v_cat.id, p_photo_url)
  on conflict (user_id, cat_id) do nothing;

  return v_cat;
end;
$$;

grant execute on function public.create_cat_with_capture(
  text, uuid, text, text, text, text, text, double precision, double precision,
  text, text, text, text
) to authenticated;
