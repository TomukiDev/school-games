create table if not exists public.player_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  current_streak_days integer not null default 0,
  last_play_date date,
  updated_at timestamptz not null default now()
);

create index if not exists player_progress_level_idx on public.player_progress (level);

alter table public.player_progress enable row level security;

create policy "Users can read own progress"
  on public.player_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.player_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.player_progress for update
  using (auth.uid() = user_id);
