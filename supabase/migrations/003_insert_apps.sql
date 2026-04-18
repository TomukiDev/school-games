
-- to create new UUIDS: 
-- SELECT uuid_in(overlay(overlay(md5(random()::text || ':' || random()::text) placing '4' from 13) placing to_hex(floor(random()*(11-8+1) + 8)::int)::text from 17)::cstring);


insert into public.app (id, name)
  values ('6b2a68b9-82a5-4168-88e2-a8f67a40dd56', 'Tabelline', 1)
  on conflict (id) do nothing;
  