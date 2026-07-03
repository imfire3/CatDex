insert into storage.buckets (id, name, public)
values ('cat-photos', 'cat-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read cat photos" on storage.objects;
drop policy if exists "Authenticated users can upload cat photos" on storage.objects;

create policy "Public read cat photos"
  on storage.objects for select
  using (bucket_id = 'cat-photos');

create policy "Authenticated users can upload cat photos"
  on storage.objects for insert
  with check (
    bucket_id = 'cat-photos'
    and auth.role() = 'authenticated'
  );
