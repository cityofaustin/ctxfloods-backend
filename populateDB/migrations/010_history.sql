create extension if not exists btree_gin; -- for compound indexes with an array
create index on floods.crossing using gin (id, community_ids);
create index on floods.status_update (created_at);
create index on floods.status_update (crossing_id);

create type floods.status_update_history as (
  status_update_id integer,
  user_id integer,
  user_last_name text,
  user_first_name text,
  status_id integer,
  status_name text,
  status_reason_name text,
  reopen_date date,
  indefinite_closure boolean,
  created_at timestamp without time zone,
  notes text,
  crossing_id integer,
  crossing_name text,
  crossing_human_address text,
  community_ids integer[]
);

-- function to query status_update and filter by several optional parameters
-- must plug in explicit nulls
create or replace function floods.get_status_update_history(
  crossing_id integer,
  community_id integer,
  date_lower_bound timestamp,
  date_upper_bound timestamp,
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
    crossing.community_ids as community_ids
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

comment on function floods.get_status_update_history(integer, integer, timestamp, timestamp, integer, integer) is 'Gets status updates for all crossings, a single crossing, or all crossings in a community. Can filter by date range.';
grant execute on function floods.get_status_update_history(integer, integer, timestamp, timestamp, integer, integer) to floods_community_editor;
