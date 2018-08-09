begin;

-- Using a table instead of a type for foreign key to floods.community
-- This way we can find the admins for a community in graphql
create table floods.ongoing_closure_count (
  community_id integer references floods.community(id),
  count bigint
);

create or replace function floods.ongoing_closure_count_by_community()
  returns setof floods.ongoing_closure_count as $$
  select comm.id as community_id, count(0) as count
    from floods.crossing c, (select id from floods.community) as comm
    where c.latest_status_id in (2, 3)
    and c.community_ids @> ARRAY[comm.id]
    and c.latest_status_created_at < now() - '1 day'::interval
    group by comm.id
$$ language SQL stable security definer;

end;
