--- Create function to handle adding a legacy crossing during seeding
create or replace function floods.seed_legacy_crossing(
  name text,
  human_address text,
  community_id integer,
  longitude decimal,
  latitude decimal,
  description text default '',
  legacy_id integer default null,
  waze_street_id integer default null
) returns void AS $$
declare
  new_id floods.crossing.id%TYPE;
  test_legacy_id floods.crossing.legacy_id%TYPE := legacy_id;
begin
  select id from floods.crossing where floods.crossing.legacy_id=test_legacy_id into new_id;
  if new_id is null then
    perform floods.new_crossing(
      name,
      human_address,
      community_id,
      longitude,
      latitude,
      description,
      legacy_id,
      waze_street_id
    );
  else
    perform floods.add_crossing_to_community(new_id, community_id);
  end if;
end;
$$ language plpgsql security definer;

comment on function floods.seed_legacy_crossing(text, text, integer, decimal, decimal, text, integer, integer) is 'Adds a new crossing or adds an existing legacy crossing to a community.';

grant execute on function floods.seed_legacy_crossing(text, text, integer, decimal, decimal, text, integer, integer) to floods_super_admin;
