-- Prevent anonymous users from seeing system users and emails;
grant select on table floods.user to floods_community_editor;
revoke select on table floods.user from floods_anonymous;
