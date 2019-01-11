-- Add "immutable" field to prevent api user from being manipulated or deleted.
alter table floods.user add column immutable boolean default false;
comment on column floods.user.immutable is 'Indicate that user cannot be deleted. Used for administrative functions.';

drop function floods.register_user(text, text, text, integer, text, text, text, text);
create function floods.register_user(
  first_name text,
  last_name text,
  job_title text,
  community_id integer,
  phone_number text,
  email text,
  password text,
  role text,
  immutable boolean default false
) returns floods.user as $$
declare
  floods_user floods.user;
begin
  -- If we aren't a super admin
  if current_setting('jwt.claims.role') != 'floods_super_admin' then
    if immutable = true then
      raise exception 'Only Super administrators can create immutable users';
    end if;
    -- and we are a community admin
    if current_setting('jwt.claims.role') = 'floods_community_admin' then
      -- and we're trying to add a user to a different community
      if current_setting('jwt.claims.community_id')::integer != community_id then
        raise exception 'Community administrators can only add editors to the communities they administrate';
      end if;
      -- and we're trying to add someone other than a community editor
      if role != 'floods_community_editor' then
        raise exception 'Community administrators can only add editors to the communities they administrate';
      end if;
    -- all other roles shouldn't be here
    else
      raise exception 'Only administrators can add new users';
    end if;
  end if;

  insert into floods.user (first_name, last_name, role, job_title, community_id, email_address, phone_number, immutable) values
    (first_name, last_name, role, job_title, community_id, email, phone_number, immutable)
    returning * into floods_user;

  insert into floods_private.user_account (user_id, email, role, community_id, password_hash) values
    (floods_user.id, email, role, community_id, crypt(password, gen_salt('bf')));

  return floods_user;
end;
$$ language plpgsql strict security definer;

comment on function floods.register_user(text, text, text, integer, text, text, text, text, boolean) is 'Registers a single user and creates an account.';

-- Allow community admins and up to register new users
-- NOTE: Extra logic around permissions in function
grant execute on function floods.register_user(text, text, text, integer, text, text, text, text, boolean) to floods_community_admin;

create or replace function floods.deactivate_user(
  user_id integer
) returns floods.user as $$
declare
  floods_user floods.user;
  deactivated_user floods.user;
begin
  -- Get the user
  select * from floods.user where id = user_id into floods_user;

  -- If we aren't a super admin
  if current_setting('jwt.claims.role') != 'floods_super_admin' then
    -- and we are a community admin
    if current_setting('jwt.claims.role') = 'floods_community_admin' then
      -- and we're trying to delete a user in a different community
      if current_setting('jwt.claims.community_id')::integer != floods_user.community_id then
        raise exception 'Community administrators can only deactivate users in their community';
      end if;
    end if;

    -- and we are a community editor
    if current_setting('jwt.claims.role') = 'floods_community_editor' then
      -- and we're trying to delete a user other than ourselves
      if current_setting('jwt.claims.user_id')::integer != floods_user.id then
        raise exception 'Community editors can only deactivate themselves';
      end if;
    end if;

  end if;

  if floods_user.immutable = true then
    raise exception 'Cannot deactivate immutable user';
  end if;

  delete from floods_private.user_account where floods_private.user_account.user_id = deactivate_user.user_id;

  update floods.user
    set active = false
    where id = user_id
    returning * into deactivated_user;

  return deactivated_user;
end;
$$ language plpgsql strict security definer;

-- Create function to search users
-- TODO: plainto_tsquery probably won't do everything we need, so we'll need to implement something else to form a valid tsquery for search on the frontend
create or replace function floods.search_users(
  search text default null,
  community integer default null
) returns setof floods.user as $$
  select resultuser
  from (select
      u as resultuser,
      to_tsvector(u.first_name) ||
      to_tsvector(u.last_name) ||
      to_tsvector(c.name) as document
    from
      floods.user u,
      floods.community c
    where
      u.immutable is false and
      u.community_id = c.id and
      (community is null or community = u.community_id)
  ) user_search
  where
    search is null or user_search.document @@ plainto_tsquery(search);
$$ language sql stable security definer;

comment on function floods.search_users(text, integer) is 'Searches users.';
