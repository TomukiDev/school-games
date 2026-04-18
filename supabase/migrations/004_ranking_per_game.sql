-- Una riga per (utente, gioco): livello e punti migliori registrati.

drop policy if exists "Users can read own ranking" on public.ranking;
drop policy if exists "Users can insert own ranking" on public.ranking;
drop policy if exists "Users can update own ranking" on public.ranking;

drop table if exists public.ranking;

create table public.ranking (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id uuid not null references public.app (id) on delete cascade,
  level integer not null,
  points integer not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create index if not exists ranking_user_id_idx on public.ranking (user_id);

alter table public.ranking enable row level security;

create policy "Users can read own rankings"
  on public.ranking for select
  using (auth.uid() = user_id);

create policy "Users can insert own rankings"
  on public.ranking for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rankings"
  on public.ranking for update
  using (auth.uid() = user_id);
