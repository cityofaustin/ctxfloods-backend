begin;

-- Set the jwt claim settings so the register user function works
-- Make sure they're local so we actually use the token outside of this script
select set_config('jwt.claims.community_id', '1', true);
select set_config('jwt.claims.role', 'floods_super_admin', true);
-- Add super admin
select floods.register_user(text 'Super', text 'Admin', text 'Superhero, Administrator', integer '9009', text '867-5309', text 'superadmin@flo.ods', text 'texasfloods', text 'floods_super_admin');

commit;
