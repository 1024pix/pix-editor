module.exports = [
  require('./application/healthcheck'),
  require('./application/static'),
  require('./application/areas'),
  require('./application/users'),
  require('./application/config'),
  require('./application/airtable-proxy'),
  require('./application/releases'),
  require('./application/file-storage-token'),
];
