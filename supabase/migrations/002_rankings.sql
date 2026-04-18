-- Esegui nel SQL Editor di Supabase (o con CLI) prima di usare l'app.

create table if not exists public.app (
  id uuid primary key,
  name text, 
  priority integer
);

alter table public.app enable row level security;

create policy "Users can read apps"
  on public.app for select
  using (true);


create table if not exists public.ranking (
  id uuid primary key references auth.users (id) on delete cascade,
  game_id uuid references public.app(uuid),
  level integer,
  points integer,
  updated_at timestamptz not null default now()
);

alter table public.ranking enable row level security;

create policy "Users can read own ranking"
  on public.ranking for select
  using (auth.uid() = id);

create policy "Users can insert own ranking"
  on public.ranking for insert
  with check (auth.uid() = id);

create policy "Users can update own ranking"
  on public.ranking for update
  using (auth.uid() = id);