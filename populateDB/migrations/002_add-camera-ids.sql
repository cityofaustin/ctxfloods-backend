begin;

-- Update the Crossings table and add camera type and id
alter table floods.crossing
  add column camera_type text;
comment on column floods.crossing.camera_type is 'The type of camera associated with this crossing.';

alter table floods.crossing
  add column camera_id text;
comment on column floods.crossing.camera_id is 'The id of a camera associated with this crossing.';

--- Create function to associate cameras with crossings
create function floods.set_camera_for_crossing(
  crossing_id integer,
  camera_type text,
  camera_id text
) returns floods.crossing as $$
declare
  updated_crossing floods.crossing;
begin

  update floods.crossing
    set camera_type = set_camera_for_crossing.camera_type, camera_id = set_camera_for_crossing.camera_id 
    where id = set_camera_for_crossing.crossing_id;

  -- Get the crossing
  select * from floods.crossing where id = set_camera_for_crossing.crossing_id into updated_crossing;

  return updated_crossing;
end;
$$ language plpgsql strict security definer;

comment on function floods.set_camera_for_crossing(integer, text, text) is 'Sets a camera for a crossing.';

-- Allow community editors and up to add cameras to crossings
grant execute on function floods.set_camera_for_crossing(integer, text, text) to floods_community_editor;

commit;
