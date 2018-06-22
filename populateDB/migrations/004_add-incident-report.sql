begin;

create table floods.incident_report (
  id serial primary key,
  notes text,
  location_description text,
  coordinates geometry not null,
  community_ids integer[],
  created_at timestamp default now()
);

grant select on table floods.incident_report to floods_anonymous;

create or replace function floods.new_incident_report(
  notes text,
  location_description text,
  longitude decimal,
  latitude decimal,
  community_ids integer[]
) returns floods.incident_report as $$
declare
  floods_incident_report floods.incident_report;
begin
  insert into floods.incident_report (notes, location_description, coordinates, community_ids) values
    (notes, location_description, ST_MakePoint(longitude, latitude), community_ids)
    returning * into floods_incident_report;

  return floods_incident_report;
end;
$$ language plpgsql security definer;

comment on function floods.new_incident_report(text, text, decimal, decimal, integer[]) is 'Adds an incident report.';

grant execute on function floods.new_incident_report(text, text, decimal, decimal, integer[]) to floods_community_editor;

create or replace function floods.find_users_in_communities(community_ids integer[])
  returns setof floods.user as $$
		select * from floods.user
    where array_position(community_ids, community_id) >= 0
    and active = true
$$ language SQL stable security definer;

grant execute on function floods.find_users_in_communities(community_ids integer[]) to floods_anonymous;

end;
