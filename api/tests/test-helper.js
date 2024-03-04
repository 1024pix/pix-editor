import { afterEach } from 'vitest';
import * as infraErrors from '../lib/infrastructure/errors.js';
import { cache } from '../lib/infrastructure/cache.js';
import nock from 'nock';
import { DatabaseBuilder } from './tooling/database-builder/database-builder.js';
import { AirtableBuilder } from './tooling/airtable-builder/airtable-builder.js';
import { InputOutputDataBuilder }  from './tooling/input-output-data-builder/input-output-data-builder.js';
import { knex } from '../db/knex-database-connection.js';
import './tooling/vitest-custom-matchers/index.js';

afterEach(async () => {
  airtableBuilder.cleanAll();
  await databaseBuilder.clean();
  cache.flushAll();
  nock.cleanAll();
});

export { streamToPromise, streamToPromiseArray } from '../lib/infrastructure/utils/stream-to-promise.js';

// Knex
export { knex };

// Input Data Builder
export const inputOutputDataBuilder = new InputOutputDataBuilder();

// DatabaseBuilder
export const databaseBuilder = new DatabaseBuilder({ knex });

// Hapi
export const hFake = {
  response(source) {
    return {
      source,
      code(c) {
        this.statusCode = c;
        return this;
      },
      headers: {},
      header(key, value) {
        this.headers[key] = value;
        return this;
      },
      type(type) {
        this.contentType = type;
        return this;
      },
      takeover() {
        this.isTakeOver = true;
        return this;
      },
      created() {
        this.statusCode = 201;
        return this;
      }
    };
  },
  authenticated(data) {
    return {
      authenticated: data
    };
  },
  redirect(location) {
    return {
      location
    };
  },
  file(path, options) {
    return this.response({ path, options });
  },
  continue: Symbol('continue'),
};

export function catchErr(promiseFn, ctx) {
  return async (...args) => {
    try {
      await promiseFn.call(ctx, ...args);
      return 'should have thrown an error';
    } catch (err) {
      return err;
    }
  };
}

// airtableBuilder
export const airtableBuilder = new AirtableBuilder({ nock });

export function generateAuthorizationHeader(user) {
  return { authorization: `Bearer ${user.apiKey}` };
}

export { domainBuilder } from './tooling/domain-builder/domain-builder.js';

export const testErr = new Error('Fake Error');
export const testInfraNotFoundErr = new infraErrors.NotFoundError('Fake infra NotFoundError');
