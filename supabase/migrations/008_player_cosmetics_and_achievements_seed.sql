alter table public.profiles
  add column if not exists mascot_skin text not null default 'classic';

create table if not exists public.cosmetics (
  id uuid primary key,
  slug text unique not null,
  label text not null,
  kind text not null check (kind in ('mascot_skin')),
  unlock_level integer,
  unlock_achievement_id uuid references public.achievements (id) on delete set null
);

create table if not exists public.user_cosmetics (
  user_id uuid not null references auth.users (id) on delete cascade,
  cosmetic_id uuid not null references public.cosmetics (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, cosmetic_id)
);

create index if not exists user_cosmetics_user_id_idx on public.user_cosmetics (user_id);

alter table public.cosmetics enable row level security;
alter table public.user_cosmetics enable row level security;

create policy "Users can read cosmetics catalog"
  on public.cosmetics for select
  using (true);

create policy "Users can read own cosmetics"
  on public.user_cosmetics for select
  using (auth.uid() = user_id);

create policy "Users can insert own cosmetics"
  on public.user_cosmetics for insert
  with check (auth.uid() = user_id);

insert into public.achievements (id, slug, title, description, icon_key, game_id)
values
  ('2b3f6494-dc7e-457f-bf8c-f593a5dcdb33', 'first-round', 'Primo Round', 'Hai completato il tuo primo round.', 'star', null),
  ('9be46157-d084-4cc2-84ec-84bd9dc70f94', 'record-breaker', 'Nuovo Record', 'Hai battuto il tuo record personale in una sfida.', 'trophy', null),
  ('7a2f70aa-c37f-4f3a-98a4-f98639fd1db4', 'tabelline-solo-one', 'Specialista', 'Hai completato un round Tabelline con una sola tabellina selezionata.', 'spark', '6b2a68b9-82a5-4168-88e2-a8f67a40dd56'),
  ('f849f5bc-dbe5-49bc-9d5b-6d7f689ece84', 'tabelline-all', 'Collezionista', 'Hai giocato Tabelline con tutte le tabelline selezionate.', 'crown', '6b2a68b9-82a5-4168-88e2-a8f67a40dd56'),
  ('c349f31f-d39d-4ef4-9f98-b318cbadac53', 'clock-12h', 'Modalita 12h', 'Hai completato un round Orologio in formato 12h.', 'clock', '7c9e4b2a-1d3f-4e8c-9a5b-2f6e8d1c4a90'),
  ('637f00f8-98ac-4580-9f33-4faaeb762f90', 'clock-expert', 'Occhio Esperto', 'Hai completato un round Orologio con categoria Esperti.', 'medal', '7c9e4b2a-1d3f-4e8c-9a5b-2f6e8d1c4a90'),
  ('dfc1bbfc-d419-47d4-b8e6-3214fccfcbaf', 'streak-3', 'Tris di Giorni', 'Hai giocato per 3 giorni di fila.', 'flame', null),
  ('1bc4e5da-f3b3-4e56-9f4f-d3fa8a723a42', 'streak-7', 'Settimana Super', 'Hai giocato per 7 giorni di fila.', 'rocket', null)
on conflict (id) do nothing;

insert into public.cosmetics (id, slug, label, kind, unlock_level, unlock_achievement_id)
values
  ('615fd4fd-baf9-4d84-a524-a39f48f8fa2d', 'classic', 'Classico', 'mascot_skin', 1, null),
  ('4de4f9d8-6043-4705-84e9-e327dcecca2b', 'sunny', 'Sole', 'mascot_skin', 3, null),
  ('c67ac66c-cde4-4f6c-b9e6-4317cd9f0450', 'galaxy', 'Galassia', 'mascot_skin', null, '1bc4e5da-f3b3-4e56-9f4f-d3fa8a723a42')
on conflict (id) do nothing;
