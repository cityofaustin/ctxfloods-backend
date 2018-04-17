begin;

-- Add communities for the tons of crossings
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9001, 'Leander', 'LEA', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9003, 'Cedar Park', 'CPK', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9004, 'Round Rock', 'RRK', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9005, 'West Lake Hills', 'WLH', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9006, 'Marble Falls', 'MBF', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9007, 'Sunset Valley', 'SSV', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9008, 'Pflugerville', 'pfl', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9009, 'City of Austin', 'COA', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9010, 'Travis County', 'TCO', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9011, 'Caldwell County', 'CCO', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9012, 'Bastrop County', 'BCO', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9013, 'Lee County', 'LEECO',ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9014, 'Rollingwood', 'ROL', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9015, 'Georgetown', 'GEO', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9016, 'Hays County', 'HCO', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9017, 'Williamson County', 'WCO', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));
insert into floods.community (id, name, abbreviation, viewportgeojson) values (9018, 'Fayette County', 'FCO', ST_AsGeoJSON(ST_MakeEnvelope(-97.785240, 30.259219, -97.753574, 30.276096)));

commit;
