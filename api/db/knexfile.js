import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
import * as dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, '../.env') });

function localPostgresEnv(databaseUrl) {
  return {
    client: 'postgresql',
    connection: databaseUrl,
    pool: {
      min: parseInt(process.env.DATABASE_CONNECTION_POOL_MIN_SIZE) || 1,
      max: parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE) || 4,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
      stub: './migration-template.js',
    },
    seeds: {
      directory: './seeds',
    },
    asyncStackTraces: process.env.KNEX_ASYNC_STACKTRACE_ENABLED !== 'false',
  };
}

export const development = localPostgresEnv(process.env.DATABASE_URL);

export const test = localPostgresEnv(process.env.TEST_DATABASE_URL);

export const staging = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: parseInt(process.env.DATABASE_CONNECTION_POOL_MIN_SIZE) || 1,
    max: parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE) || 4,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
  asyncStackTraces: process.env.KNEX_ASYNC_STACKTRACE_ENABLED !== 'false',
};

export const production = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: parseInt(process.env.DATABASE_CONNECTION_POOL_MIN_SIZE) || 1,
    max: parseInt(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE) || 4,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
  ssl: process.env.DATABASE_SSL_ENABLED === 'true',
  asyncStackTraces: process.env.KNEX_ASYNC_STACKTRACE_ENABLED !== 'false',
};
