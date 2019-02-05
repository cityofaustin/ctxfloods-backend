-- save all timestamps with time zones

alter table floods.crossing
alter column latest_status_created_at set data type timestamp with time zone;

alter table floods.status_update
alter column created_at set data type timestamp with time zone;

alter table floods.incident_report
alter column created_at set data type timestamp with time zone;

---- update camera values

alter table floods.camera_image
alter column uploaded_at set data type timestamp with time zone;

alter type floods.camera_with_latest_photo
alter attribute uploaded_at set data type timestamp with time zone;

drop function floods.add_camera_image(integer, text, timestamp);
create or replace function floods.add_camera_image (
  camera_id integer,
  url text,
  uploaded_at timestamp with time zone default now()
) returns integer as $$
declare
  camera_image_id integer;
  input_camera_id integer := camera_id;
begin
  insert into floods.camera_image(camera_id, url, uploaded_at)
    values (input_camera_id, url, uploaded_at)
    returning id into camera_image_id;

  -- Only keep 5 most recent images for each camera
  delete from floods.camera_image
  where id in (
  	select id from
  	(
  		select id, row_number() over (order by ci.uploaded_at desc) as rn
  		from floods.camera_image ci
      where ci.camera_id = input_camera_id
  	) sq01 where rn > 5
  );

  return camera_image_id;
end;
$$ language plpgsql security definer;

comment on function floods.add_camera_image(integer, text, timestamp with time zone) is 'Adds an image for a camera and ensures that only a mamximum of 5 images remain stored.';
grant execute on function floods.add_camera_image(integer, text, timestamp with time zone) to floods_super_admin;

---- update history values

alter type floods.status_update_history
alter attribute created_at set data type timestamp with time zone;

drop function floods.get_status_update_history(integer, integer, timestamp, timestamp, integer, integer);
-- function to query status_update and filter by several optional parameters
-- must plug in explicit nulls
create or replace function floods.get_status_update_history(
  crossing_id integer,
  community_id integer,
  date_lower_bound timestamp with time zone,
  date_upper_bound timestamp with time zone,
  id_upper_bound integer, -- for pagination
  row_limit integer -- for pagination
) returns setof floods.status_update_history AS $$
declare
  test_crossing_id floods.crossing.id%TYPE := crossing_id;
  test_crossing_id_exists boolean := (coalesce(test_crossing_id, null) is not null);
  test_community_id integer := community_id;
  test_community_id_exists boolean := (coalesce(test_community_id, null) is not null);
  date_lower_bound_exists boolean := (coalesce(date_lower_bound, null) is not null);
  date_upper_bound_exists boolean := (coalesce(date_upper_bound, null) is not null);
  id_upper_bound_exists boolean := (coalesce(id_upper_bound, null) is not null);
begin
  return query
  select
    status_update.id as status_update_id,
    floods.user.id as user_id,
    floods.user.last_name as user_last_name,
    floods.user.first_name as user_first_name,
    status.id as status_id,
    status.name as status_name,
    status_reason.name as status_reason_name,
    status_update.reopen_date as reopen_date,
    status_update.indefinite_closure as indefinite_closure,
    status_update.created_at,
    status_update.notes,
    status_update.crossing_id,
    crossing.name as crossing_name,
    crossing.human_address as crossing_human_address,
    crossing.geojson as geojson,
    array(
      select
      com.name
      from ( select unnest(crossing.community_ids) com_ids ) sq01
      left join floods.community com on com.id=sq01.com_ids
    ) communities
  from floods.status_update status_update
  join floods.user on status_update.creator_id = floods.user.id
  join floods.status status on status_update.status_id = status.id
  left join floods.status_reason status_reason on status_update.status_reason_id = status_reason.id
  join floods.crossing crossing on status_update.crossing_id = crossing.id
    -- in practice, we wouldn't search by both "crossing_id" and "community_id" in the same query
    and (
      (test_crossing_id_exists and (status_update.crossing_id = test_crossing_id))
      or
      (not test_crossing_id_exists and true)
    )
    and (
      (test_community_id_exists and (test_community_id = any (crossing.community_ids)))
      or
      (not test_community_id_exists and true)
    )
  where
    (
      (date_lower_bound_exists and (status_update.created_at >= date_lower_bound))
      or
      (not date_lower_bound_exists and true)
    )
    and (
      (date_upper_bound_exists and (status_update.created_at <= date_upper_bound))
      or
      (not date_upper_bound_exists and true)
    )
    and (
      (id_upper_bound_exists and (status_update.id < id_upper_bound))
      or
      (not id_upper_bound_exists and true)
    )
  order by status_update.id desc
  limit coalesce(row_limit, null)
  ;
  return;
end;
$$ language plpgsql stable security definer;

comment on function floods.get_status_update_history(integer, integer, timestamp with time zone, timestamp with time zone, integer, integer) is 'Gets status updates for all crossings, a single crossing, or all crossings in a community. Can filter by date range.';
grant execute on function floods.get_status_update_history(integer, integer, timestamp with time zone, timestamp with time zone, integer, integer) to floods_community_editor;
grant execute on function floods.get_status_update_history(integer, integer, timestamp with time zone, timestamp with time zone, integer, integer) to floods_anonymous;


-- TODO: will I need to convert existing dates?
