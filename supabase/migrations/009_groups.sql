create table if not exists public.player_groups (
  id uuid primary key,
  name text not null,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.player_group_members (
  group_id uuid not null references public.player_groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists player_group_members_user_id_idx on public.player_group_members (user_id);

alter table public.player_groups enable row level security;
alter table public.player_group_members enable row level security;

create policy "Users can read groups where they are members"
  on public.player_groups for select
  using (
    exists (
      select 1
      from public.player_group_members m
      where m.group_id = player_groups.id
        and m.user_id = auth.uid()
    )
  );

create policy "Users can create groups"
  on public.player_groups for insert
  with check (auth.uid() = owner_user_id);

create policy "Users can read own memberships"
  on public.player_group_members for select
  using (auth.uid() = user_id);

create policy "Group owners can add members"
  on public.player_group_members for insert
  with check (
    exists (
      select 1
      from public.player_groups g
      where g.id = player_group_members.group_id
        and g.owner_user_id = auth.uid()
    )
  );
