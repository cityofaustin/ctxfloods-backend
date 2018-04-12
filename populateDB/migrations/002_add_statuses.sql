begin;

-- Add statuses
insert into floods.status (id, name) values
  (1, 'Open'),
  (2, 'Closed'),
  (3, 'Caution'),
  (4, 'Long-Term Closure');
alter sequence floods.status_id_seq restart with 5;

-- Add status reasons
insert into floods.status_reason (id, status_id, name) values
  (1, 2, 'Flooded'),
  (2, 4, 'Bridge Broken'),
  (3, 3, 'Unconfirmed Flooding');
alter sequence floods.status_reason_id_seq restart with 4;

-- Add status durations
insert into floods.status_duration (id, name, timespan) values
  (1, 'A Minute', interval '1 minute'),
  (2, 'A Week', interval '1 week');
alter sequence floods.status_duration_id_seq restart with 3;

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

commit;
