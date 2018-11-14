create table floods.push_log (
  id               serial primary key,
  date             date not null,
  user_id          integer references floods.user(id),
  status_updates   integer[],
  success          boolean not null,
  error_message    text default null
);

comment on table floods.push_log is 'track metadata about email notifications that get sent to admins';
comment on column floods.push_log.id is 'The primary unique identifier for the log.';
comment on column floods.push_log.date is 'The date the email was sent.';
comment on column floods.push_log.user_id is 'The user who received the email';
comment on column floods.push_log.status_updates is 'The status updates this email was notifying about.';
comment on column floods.push_log.success is 'Whether the email was successfully sent or not.';
comment on column floods.push_log.error_message is 'The error message in the event of a failure.';

grant select on floods.push_log to floods_super_admin;

create function floods.new_push_log_function(
  date date,
  user_id integer,
  status_updates integer[],
  success boolean,
  error_message text
) returns floods.push_log as $$
declare
  new_push_log floods.push_log;
begin
  insert into floods.push_log (date, user_id, status_updates, success, error_message) values
    (date, user_id, status_updates, success, error_message)
    returning * into new_push_log;
  return new_push_log;
end;
$$ language plpgsql security definer;
comment on function floods.new_push_log_function(date, integer, integer[], boolean, text) is 'Adds a new push log.';
grant execute on function floods.new_push_log_function(date, integer, integer[], boolean, text) to floods_super_admin;
