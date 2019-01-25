-- Create trigger to save all email addresses in lowercase
create or replace function lowercase_emails_user_proc()
  returns trigger as $$
begin
  NEW.email_address := lower(NEW.email_address);
  return NEW;
end;
$$ language plpgsql;

create function lowercase_emails_user_acc_proc()
  returns trigger as $$
begin
  NEW.email := lower(NEW.email);
  return NEW;
end;
$$ language plpgsql;

create trigger lowercase_emails_user_trg
  before insert or update of email_address
  on floods.user
  for each row
  execute procedure lowercase_emails_user_proc();

create trigger lowercase_emails_user_acc_trg
  before insert or update of email
  on floods_private.user_account
  for each row
  execute procedure lowercase_emails_user_acc_proc();

-- Convert historical email addresses to lowercase
update floods.user set email_address = lower(email_address);
update floods_private.user_account set email = lower(email);

-- Create function to authenticate users by email and password, returning a jwt token
-- set submitted emails to lowercase
create or replace function floods.authenticate(
  email text,
  password text
) returns floods.jwt_token as $$
declare
  account floods_private.user_account;
begin
  select a.* into account
  from floods_private.user_account as a
  where a.email = lower(authenticate.email);

  if account.password_hash = crypt(password, account.password_hash) then
    return (account.role, account.user_id, account.community_id)::floods.jwt_token;
  else
    raise exception 'Bad Authentication';
    return null;
  end if;
end;
$$ language plpgsql strict security definer;

comment on function floods.authenticate(text, text) is 'Creates a JWT token that will securely identify a user and give them certain permissions.';
grant execute on function floods.authenticate(text, text) to floods_anonymous;
