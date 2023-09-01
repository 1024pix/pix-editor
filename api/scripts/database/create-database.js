import * as dotenv from 'dotenv';
dotenv.config();
import { PgClient } from '../PgClient.js';
import { PGSQL_DUPLICATE_DATABASE_ERROR } from '../../db/pgsql-errors.js';

const dbUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

const url = new URL(dbUrl);

const DB_TO_CREATE_NAME = url.pathname.slice(1);

url.pathname = '/postgres';

const client = new PgClient(url.href);

client.query_and_log(`CREATE DATABASE ${DB_TO_CREATE_NAME};`)
  .then(function() {
    console.log('Database created');
    client.end();
    process.exit(0);
  }).catch((error) => {
    if (error.code === PGSQL_DUPLICATE_DATABASE_ERROR) {
      console.log(`Database ${DB_TO_CREATE_NAME} already created`);
      client.end();
      process.exit(0);
    }
    else {
      throw error;
    }
  });
