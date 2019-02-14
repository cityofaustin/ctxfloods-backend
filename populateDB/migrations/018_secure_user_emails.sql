-- floods_anonymous still needs to see some user information 
grant select (id, first_name, last_name, role, job_title, community_id) on table floods.user to floods_anonymous;
