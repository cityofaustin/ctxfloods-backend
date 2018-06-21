begin;

create or replace function floods.waze_feed()
  returns table (i json)
as $$

select row_to_json(w) from (
  select
    latest_status_update_id as id,
    'todo' as street,
    to_char(st_y (c.coordinates), 'FM999.000000') || ' ' ||
      to_char(st_x (c.coordinates), 'FM999.000000') || ' ' ||
      to_char(st_y (c.coordinates), 'FM999.000000') || ' ' ||
      to_char(st_x (c.coordinates), 'FM999.000000') as polyline,
    'BOTH_DIRECTIONS' as direction,
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
    'CTXfloods' as reference
  from
    floods.crossing c
    join floods.status_update su on c.latest_status_update_id = su.id
  where
    c.latest_status_id != 1
) w
$$ language SQL stable security definer;

grant execute on function floods.waze_feed() to floods_anonymous;

commit;
