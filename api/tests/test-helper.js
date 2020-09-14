// Errors
const infraErrors = require('../lib/infrastructure/errors');
// Chai
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
chai.use(require('chai-sorted'));
// Sinon
const sinon = require('sinon');
chai.use(require('sinon-chai'));

afterEach(async () => {
  airtableBuilder.cleanAll();
  await databaseBuilder.clean();
  return sinon.restore();
});

// Knex
const { knex } = require('../db/knex-database-connection');

// DatabaseBuilder
const DatabaseBuilder = require('./tooling/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

// Hapi
const hFake = {
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

function catchErr(promiseFn, ctx) {
  return async (...args) => {
    try {
      await promiseFn.call(ctx, ...args);
      return 'should have thrown an error';
    } catch (err) {
      return err;
    }
  };
}

// Nock
const nock = require('nock');
nock.disableNetConnect();

// airtableBuilder
const AirtableBuilder = require('./tooling/airtable-builder/airtable-builder');
const airtableBuilder = new AirtableBuilder({ nock });

module.exports = {
  airtableBuilder,
  domainBuilder: require('./tooling/domain-builder/factory'),
  databaseBuilder,
  expect,
  hFake,
  knex,
  sinon,
  catchErr,
  testErr: new Error('Fake Error'),
  testInfraNotFoundErr: new infraErrors.NotFoundError('Fake infra NotFoundError'),
};
