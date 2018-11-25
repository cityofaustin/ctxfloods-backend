-- Undo error in existing comments
comment on column floods.community.name is 'The name of the community.';
comment on column floods.community.abbreviation is 'The abbreviation for the community.';

-- Abbreviations are only required for legacy communities
alter table floods.community alter column abbreviation drop not null;
alter function floods.new_community(text, text) called on null input;

alter sequence floods.community_id_seq restart with 9019;

-- Adds to a new crossing to a new community
create function floods.add_crossing_with_new_community(
  crossing_name text,
  human_address text,
  longitude decimal,
  latitude decimal,
  community_name text,
  description text default '',
  legacy_id integer default null,
  waze_street_id integer default null
) returns floods.crossing as $$
declare
  new_community_id integer;
  floods_crossing floods.crossing;
begin
  select id into new_community_id from floods.new_community(community_name, null);
  select * into floods_crossing from floods.new_crossing(crossing_name, human_address, new_community_id, longitude, latitude, description, legacy_id, waze_street_id);
  return floods_crossing;
end;
$$ language plpgsql security definer;

comment on function floods.add_crossing_with_new_community(text, text, decimal, decimal, text, text, integer, integer) is 'Adds a new crossing to a new community.';
grant execute on function floods.add_crossing_with_new_community(text, text, decimal, decimal, text, text, integer, integer) to floods_super_admin;

-- Adds to a new user to a new community
create function floods.register_user_with_new_community(
  first_name text,
  last_name text,
  job_title text,
  phone_number text,
  email text,
  password text,
  role text,
  community_name text
) returns floods.user as $$
declare
  new_community_id integer;
  floods_user floods.user;
begin
  select id from floods.new_community(community_name, null) into new_community_id;
  select * into floods_user from floods.register_user(first_name, last_name, job_title, new_community_id, phone_number, email, password, role);
  return floods_user;
end;
$$ language plpgsql security definer;

comment on function floods.register_user_with_new_community(text, text, text, text, text, text, text, text) is 'Adds a new user to new community.';
grant execute on function floods.register_user_with_new_community(text, text, text, text, text, text, text, text) to floods_super_admin;
