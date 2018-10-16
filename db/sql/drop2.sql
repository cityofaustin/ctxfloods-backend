-- Close all connections to floods in order to drop database

DO
$do$
BEGIN
IF EXISTS (select 1 from pg_database where datname='floods') THEN
  PERFORM pg_terminate_backend(pg_stat_activity.pid)
  FROM pg_stat_activity
  WHERE pg_stat_activity.datname = 'floods'
    AND pid <> pg_backend_pid();
END IF;
END
$do$
