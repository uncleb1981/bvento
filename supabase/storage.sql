-- Run this once in the Supabase SQL editor to enable bike photo uploads.
-- Creates a public storage bucket and permissive policies matching the
-- current mock/no-real-auth-gate state of bike posting (src/app/bikes/create).
-- Tighten the insert policy to `auth.role() = 'authenticated'` once bike
-- posting requires a real signed-in user.

insert into storage.buckets (id, name, public)
values ('bike-photos', 'bike-photos', true)
on conflict (id) do nothing;

create policy "Public read access for bike photos"
on storage.objects for select
using (bucket_id = 'bike-photos');

create policy "Anyone can upload bike photos"
on storage.objects for insert
with check (bucket_id = 'bike-photos');
