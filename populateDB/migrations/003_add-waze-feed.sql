begin;

----------------------------------------
----- waze_street table
----------------------------------------

create table floods.waze_street (
  id serial primary key,
  coordinates geometry,
  distance decimal,
  name text,
  names text[],
  created_at timestamp default now(),
  updated_at timestamp default now()
);
comment on table floods.waze_street is 'A street name suggested by the Waze geocoder. When we query the waze geocoder it can return multiple matching streets. For waze to consume the waze_feed they need our street names to match their internal names.';
grant select on table floods.waze_street to floods_anonymous;

create function floods.waze_street_human_coordinates(waze_street floods.waze_street) returns text as $$
  select ST_AsLatLonText(waze_street.coordinates);
$$ language sql stable security definer;

comment on function floods.waze_street_human_coordinates(floods.waze_street) is 'Adds a human readable coordinates as a string in the Degrees, Minutes, Seconds representation.';
grant execute on function floods.waze_street_human_coordinates(floods.waze_street) to floods_anonymous;

alter table floods.crossing
  add column waze_street_id integer references floods.waze_street(id);
comment on column floods.crossing.waze_street_id is 'The crossings street name according to the Waze geocoder.';

create or replace function floods.new_waze_street(
  longitude decimal,
  latitude decimal,
  distance decimal,
  name text,
  names text[],
  created_at timestamp,
  updated_at timestamp
) returns floods.waze_street as $$
declare
  floods_waze_street floods.waze_street;
begin
  insert into floods.waze_street (coordinates, distance, name, names, created_at, updated_at) values
    (ST_MakePoint(longitude, latitude), distance, name, names, created_at, updated_at)
    returning * into floods_waze_street;
  return floods_waze_street;
end;
$$ language plpgsql security definer;

comment on function floods.new_waze_street(decimal, decimal, decimal, text, text[], timestamp, timestamp) is 'Adds a waze street. Uses the default autoincrement id.';

grant execute on function floods.new_waze_street(decimal, decimal, decimal, text, text[], timestamp, timestamp) to floods_community_editor;

create or replace function floods.new_waze_street_with_id(
  id integer,
  longitude decimal,
  latitude decimal,
  distance decimal,
  name text,
  names text[],
  created_at timestamp,
  updated_at timestamp
) returns floods.waze_street as $$
declare
  floods_waze_street floods.waze_street;
begin
  insert into floods.waze_street (id, coordinates, distance, name, names, created_at, updated_at) values
    (id, ST_MakePoint(longitude, latitude), distance, name, names, created_at, updated_at)
    returning * into floods_waze_street;
  return floods_waze_street;
end;
$$ language plpgsql security definer;

comment on function floods.new_waze_street_with_id(integer, decimal, decimal, decimal, text, text[], timestamp, timestamp) is 'Adds a waze street. You must specify the id. Used to populate the initial data from wazeStreets.csv.';

grant execute on function floods.new_waze_street_with_id(integer, decimal, decimal, decimal, text, text[], timestamp, timestamp) to floods_community_editor;

----------------------------------------
----- Add waze_street_id to new_crossing
----------------------------------------

-- Update create new_crossing function with waze_street_id
drop function floods.new_crossing(text, text, integer, decimal, decimal, text, integer);
create or replace function floods.new_crossing(
  name text,
  human_address text,
  community_id integer,
  longitude decimal,
  latitude decimal,
  description text default '',
  legacy_id integer default null,
  waze_street_id integer default null
) returns floods.crossing as $$
declare
  floods_crossing floods.crossing;
  floods_status_update floods.status_update;
begin
  -- If we aren't a super admin
  if current_setting('jwt.claims.role') != 'floods_super_admin' then
    -- and we're trying to add a crossing to a different community
    if current_setting('jwt.claims.community_id')::integer != community_id then
      raise exception 'Users can only add crossings to their communities';
    end if;
  end if;

  insert into floods.crossing (name, human_address, description, coordinates, geojson, legacy_id, waze_street_id) values
    (name, human_address, description, ST_MakePoint(longitude, latitude), ST_AsGeoJSON(ST_MakePoint(longitude, latitude)), legacy_id, waze_street_id)
    returning * into floods_crossing;

  update floods.crossing
    set community_ids = array_append(community_ids, community_id)
    where id = floods_crossing.id;

  -- Update the community viewport
  update floods.community
    set viewportgeojson = (select ST_AsGeoJSON(ST_Extent(c.coordinates)) from floods.crossing c where array_position(c.community_ids, community_id) >= 0)
    where id = new_crossing.community_id;

  -- Give it an inital status
  insert into floods.status_update (status_id, creator_id, crossing_id, notes) values
    (1, current_setting('jwt.claims.user_id')::integer, floods_crossing.id, 'Crossing Added')
    returning * into floods_status_update;

  update floods.crossing
    set latest_status_update_id = floods_status_update.id
    where id = floods_status_update.crossing_id;

  update floods.crossing
    set latest_status_id = floods_status_update.status_id
    where id = floods_status_update.crossing_id;

  update floods.crossing
    set latest_status_created_at = floods_status_update.created_at
    where id = floods_status_update.crossing_id;

  return floods_crossing;
end;
$$ language plpgsql security definer;

comment on function floods.new_crossing(text, text, integer, decimal, decimal, text, integer, integer) is 'Adds a crossing.';

grant execute on function floods.new_crossing(text, text, integer, decimal, decimal, text, integer, integer) to floods_community_editor;

----------------------------------------
----- waze_feed incidents function
----------------------------------------

create type floods.waze_feed_incidents as (
  id integer,
  street text,
  polyline text,
  direction text,
  type text,
  subtype text,
  starttime timestamp,
  description text,
  reference text
);

create or replace function floods.waze_feed()
returns setof floods.waze_feed_incidents as $$
  select
    latest_status_update_id as id,
    waze_street.name as street,
    to_char(st_y (c.coordinates), 'FM999.000000') || ' ' ||
      to_char(st_x (c.coordinates), 'FM999.000000') || ' ' ||
      to_char(st_y (c.coordinates), 'FM999.000000') || ' ' ||
      to_char(st_x (c.coordinates), 'FM999.000000') as polyline,
    'BOTH_DIRECTIONS'::text as direction,
    case c.latest_status_id
      when 2 then 'ROAD_CLOSED'
      when 4 then 'ROAD_CLOSED'
      when 3 then 'HAZARD'
      end as type,
    case c.latest_status_id
      when 2 then 'ROAD_CLOSED_HAZARD'
      when 4 then 'ROAD_CLOSED_HAZARD'
      when 3 then 'HAZARD_WEATHER_FLOOD'
      end as subtype,
    su.created_at as starttime,
    su.notes as description,
    'CTXfloods'::text as reference
  from
    floods.crossing c
    join floods.status_update su on c.latest_status_update_id = su.id
    join floods.waze_street waze_street on c.waze_street_id = waze_street.id
  where
    c.latest_status_id != 1
$$ language SQL stable security definer;

grant execute on function floods.waze_feed() to floods_anonymous;

commit;
