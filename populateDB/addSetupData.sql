begin;

-- Add communities for the tons of crossings
insert into floods.community (id, name, abbreviation, viewportgeojson) values (1337, 'Super Admin World', 'SAW', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));

-- Add statuses
insert into floods.status (id, name) values
  (1, 'Open'),
  (2, 'Closed'),
  (3, 'Caution'),
  (4, 'Long-Term Closure');
alter sequence floods.status_id_seq restart with 5;

-- Add status associations
insert into floods.status_association (id, status_id, detail, rule) values
  (1, 1, 'reason', 'disabled'),
  (2, 1, 'duration', 'disabled'),
  (3, 2, 'reason', 'required'),
  (4, 2, 'duration', 'disabled'),
  (5, 3, 'reason', 'required'),
  (6, 3, 'duration', 'disabled'),
  (7, 4, 'reason', 'required'),
  (8, 4, 'duration', 'required');
alter sequence floods.status_association_id_seq restart with 9;

-- Set the jwt claim settings so the register user function works
-- Make sure they're local so we actually use the token outside of this script
select set_config('jwt.claims.community_id', '1337', true);
select set_config('jwt.claims.role', 'floods_super_admin', true);
-- Add super admin
select floods.register_user(text 'Super', text 'Admin', text 'Superhero, Administrator', integer '1337', text '867-5309', text 'superadmin@flo.ods', text 'texasfloods', text 'floods_super_admin');

commit;
