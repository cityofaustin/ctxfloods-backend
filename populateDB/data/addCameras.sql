begin;

insert into floods.camera (source_id, source, name, geojson) values
  ('4050f579-7b2b-44d1-a291-85216b1e6d08', 'beholder', '45th Street at Waller Creek', ST_AsGeoJSON(ST_MakePoint(-97.727932, 30.308405))),
  ('04c27e4a-06c8-4001-9917-43da70608054', 'beholder', '12th Street at Shoal Creek', ST_AsGeoJSON(ST_MakePoint(-97.750203, 30.27651))),
  ('055f5bf1-afe8-4b38-b64a-668d3b147206', 'beholder', 'River Plantation at Onion Creek', ST_AsGeoJSON(ST_MakePoint(-97.781689, 30.14428))),
  ('df11b8e4-9551-41dc-b8ac-6abe720db410', 'beholder', 'Bluff Springs Road at Onion Creek', ST_AsGeoJSON(ST_MakePoint(-97.769523, 30.15926))),
  ('b482fe89-cee8-4a7e-b781-67178fbab5fb', 'beholder', 'Joe Tanner at Williamson Creek', ST_AsGeoJSON(ST_MakePoint(-97.857742, 30.234073))),
  ('6d85dcd0-70f3-4ab8-b2a6-ae640f7879b5', 'beholder', 'Spicewood Springs #1 at Bull Creek', ST_AsGeoJSON(ST_MakePoint(-97.774994, 30.390326))),
  ('dd8c20b5-0fec-44c1-ba0d-2b77f9d714b2', 'beholder', 'Old Bee Caves at Williamson Creek', ST_AsGeoJSON(ST_MakePoint(-97.871414, 30.235041))),
  ('cdd18680-893b-4988-b87b-996349210134', 'beholder', 'S. 1st at Williamson Creek', ST_AsGeoJSON(ST_MakePoint(-97.776427, 30.215392))),
  ('539', 'atd', 'Cesar Chavez St / Sandra Muraida Way', ST_AsGeoJSON(ST_MakePoint(-97.7555389, 30.2664337))),
  ('100', 'atd', 'LAMAR BLVD / BARTON SPRINGS RD', ST_AsGeoJSON(ST_MakePoint(-97.723053,30.2890625)))
;
end;
