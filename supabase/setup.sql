-- 0) Extension
create extension if not exists pgcrypto;

-- 1) Core tables
create table if not exists public.venues (
  id bigserial primary key,
  name text not null,
  slug text unique not null,
  city text default 'Ciudad de México',
  country text default 'MX',
  type text,
  capacity int,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  venue_id bigint references public.venues(id) on delete cascade,
  section text,
  row text,
  seat text,
  stars numeric check (stars >= 0 and stars <= 5),
  caption text,
  photo_path text not null,
  created_at timestamptz default now(),
  ip inet
);

create or replace view venue_rating_summary as
select venue_id,
       count(*) as rating_count,
       avg(stars)::numeric(10,2) as avg_stars
from uploads
where stars is not null
group by venue_id;

-- 2) RLS policies (MVP: open reads/writes)
alter table venues enable row level security;
alter table uploads enable row level security;

drop policy if exists venues_read on venues;
create policy venues_read on venues for select using (true);

drop policy if exists uploads_read on uploads;
create policy uploads_read on uploads for select using (true);

drop policy if exists uploads_insert on uploads;
create policy uploads_insert on uploads for insert with check (true);

-- 3) Storage bucket (create in Dashboard > Storage as 'seat-photos', public)
-- Policies for public read & insert (MVP)
drop policy if exists "public read seat photos" on storage.objects;
create policy "public read seat photos"
  on storage.objects for select
  using (bucket_id = 'seat-photos');

drop policy if exists "public upload seat photos" on storage.objects;
create policy "public upload seat photos"
  on storage.objects for insert
  with check (bucket_id = 'seat-photos');

-- 4) Seed venues (Mexico City)
insert into venues (name, slug, type, capacity) values
('Estadio Azteca (Estadio Banorte Ciudad de México)', 'estadio-azteca', 'soccer', 83264),
('Estadio Olímpico Universitario', 'estadio-olimpico-universitario', 'soccer', 63186),
('Estadio Ciudad de los Deportes', 'estadio-ciudad-de-los-deportes', 'soccer', 36681),
('Arena Ciudad de México', 'arena-ciudad-de-mexico', 'arena', 22300),
('Palacio de los Deportes', 'palacio-de-los-deportes', 'arena', 17800),
('Auditorio Nacional', 'auditorio-nacional', 'concert', 9366),
('Arena México', 'arena-mexico', 'lucha', 16500),
('Estadio Alfredo Harp Helú', 'estadio-alfredo-harp-helu', 'baseball', 20062)
on conflict (slug) do nothing;
