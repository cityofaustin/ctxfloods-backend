-- Change longterm closure status_durations from fixed values to an estimated open_date.

-----
-- 1. add new columns
-----
alter table floods.status_update add column open_date date;
alter table floods.status_update add column indefinite_closure boolean default false;

-----
-- 2. drop status_duration data
-----
-- statuses that previously had a status_duration will now be set to 'indefinite_closure'
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='floods' and table_name='status_update' and column_name='status_duration_id'
  ) then
  update floods.status_update set indefinite_closure = true
  where status_duration_id is not null;
end if;
end
$$;

alter table floods.status_update drop constraint status_update_status_duration_id_fkey;
alter table floods.status_update drop column status_duration_id;
drop table floods.status_duration cascade;

-- 'duration' value cannot be removed from floods.status_detail enum
alter type floods.status_detail add value 'open_date';

update floods.status_association
set detail = 'open_date'
where detail = 'duration';

-----
-- 3. Rewrite floods.new_status_update
-----
drop function floods.new_status_update;
-- Create function to update status
create function floods.new_status_update(
  status_id integer,
  crossing_id integer,
  notes text,
  status_reason_id integer,
  open_date date,
  indefinite_closure boolean
) returns floods.status_update as $$
declare
  crossing_to_update floods.crossing;
  floods_status_update floods.status_update;
begin
  -- TODO: Remove this hacky fix and redefine as strict after
    -- https://github.com/postgraphql/postgraphql/issues/438 is closed
  if status_id is null then
    raise exception 'Status is required';
  end if;

  if crossing_id is null then
    raise exception 'Crossing is required';
  end if;

  select * from floods.crossing where id = crossing_id into crossing_to_update;

  -- If we aren't a super admin
  if current_setting('jwt.claims.role') != 'floods_super_admin' then
    -- and we're trying to update the status of a crossing in a different community
    if (array_position(crossing_to_update.community_ids, current_setting('jwt.claims.community_id')::integer) is null) then
      raise exception 'Users can only update the status of crossings within their communities';
    end if;
  end if;

  -- If the status reason is not null
  if status_reason_id is not null then
    -- but the association says it should be disabled
    if (select rule from floods.status_association where floods.status_association.status_id = new_status_update.status_id and detail = 'reason') = 'disabled' then
      -- we shouldn't be here, throw
      raise exception 'Status reasons are disabled for status:  %', (select name from floods.status where id = status_id);
    end if;

    -- but the status reason is for a different status
    if (select floods.status_reason.status_id from floods.status_reason where id = status_reason_id) != new_status_update.status_id then
      -- we shouldn't be here, throw
      raise exception 'This status reason is not for status:  %', (select name from floods.status where id = new_status_update.status_id);
    end if;
  end if;

  -- If the status reason is null
  if status_reason_id is null then
    -- but the association says it is required
    if (select rule from floods.status_association where floods.status_association.status_id = new_status_update.status_id and detail = 'reason') = 'required' then
      -- we shouldn't be here, throw
      raise exception 'Status reasons are required for status:  %', (select name from floods.status where id = status_id);
    end if;
  end if;

  -- If the status duration is not null
  if status_duration_id is not null then
    -- but the association says it should be disabled
    if (select rule from floods.status_association where floods.status_association.status_id = new_status_update.status_id and detail = 'open_date') = 'disabled' then
      -- we shouldn't be here, throw
      raise exception 'Open Dates are disabled for status:  %', (select name from floods.status where id = status_id);
    end if;
  end if;

  -- If the status reason is null
  if (open_date is null and indefinite_closure is false) then
    -- but the association says it is required
    if (select rule from floods.status_association where floods.status_association.status_id = new_status_update.status_id and detail = 'open_date') = 'required' then
      -- we shouldn't be here, throw
      raise exception 'Open Dates are required for status:  %', (select name from floods.status where id = status_id);
    end if;
  end if;

  insert into floods.status_update (status_id, creator_id, crossing_id, notes, status_reason_id, open_date, indefinite_closure) values
    (status_id, current_setting('jwt.claims.user_id')::integer, crossing_id, notes, status_reason_id, open_date, indefinite_closure)
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

  return floods_status_update;
end;
$$ language plpgsql security definer;

comment on function floods.new_status_update(integer, integer, text, integer, date, boolean) is 'Updates the status of a crossing.';
-- Allow community editors and up to update the status of crossings
-- NOTE: Extra logic around permissions in function
grant execute on function floods.new_status_update(integer, integer, text, integer, date, boolean) to floods_community_editor;
