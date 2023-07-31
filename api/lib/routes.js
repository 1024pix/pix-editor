module.exports = [
  require('./application/healthcheck'),
  require('./application/static'),
  require('./application/users'),
  require('./application/config'),
  require('./application/airtable-proxy'),
  require('./application/releases'),
  require('./application/file-storage-token'),
  require('./application/challenges'),
  require('./application/replication-data'),
  require('./application/static-courses'),
];
