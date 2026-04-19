insert into public.app (id, name)
  values ('7c9e4b2a-1d3f-4e8c-9a5b-2f6e8d1c4a90', 'Che ora è?', 2, '/games/orologio.svg')
  on conflict (id) do nothing;
