module.exports.SENTRY_DSN =
  'https://2627dd87d0fd4249a65d160aef644f88@sentry.io/1191657';

module.exports.PGCON =
  `postgresql://floods_postgraphql:xyz@${process.env.PGENDPOINT}:5432/floods`;

module.exports.PGCON_BUILD_SCHEMA =
  `postgresql://${process.env.PGUSERNAME}:${process.env.PGPASSWORD}@${process.env.PGENDPOINT}:5432/floods`
