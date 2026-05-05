create table if not exists public.achievements (
  id uuid primary key,
  slug text unique not null,
  title text not null,
  description text not null,
  icon_key text,
  game_id uuid references public.app (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists user_achievements_user_id_idx on public.user_achievements (user_id);

alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

create policy "Users can read achievements catalog"
  on public.achievements for select
  using (true);

create policy "Users can read own unlocked achievements"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "Users can insert own unlocked achievements"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);
