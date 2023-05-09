require('dotenv').config({ path: `${__dirname}/../.env` });
const { database } = require('../lib/config');

function localPostgresEnv(database) {
  return {
    client: 'postgresql',
    connection: database.url,
    pool: {
      min: database.poolMinSize,
      max: database.poolMaxSize,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    asyncStackTraces: database.asyncStackTraceEnabled,
  };
}

module.exports = {

  development: localPostgresEnv(database),

  test: localPostgresEnv(database),

  staging: {
    client: 'postgresql',
    connection: database.url,
    pool: {
      min: database.poolMinSize,
      max: database.poolMaxSize,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    asyncStackTraces: database.asyncStackTraceEnabled,
  },

  production: {
    client: 'postgresql',
    connection: database.url,
    pool: {
      min: database.poolMinSize,
      max: database.poolMaxSize,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    ssl: database.sslEnabled,
    asyncStackTraces: database.asyncStackTraceEnabled,
  },
};
