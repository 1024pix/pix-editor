const infraErrors = require('../lib/infrastructure/errors');
const chai = require('chai');
const expect = chai.expect;
const _ = require('lodash');
chai.use(require('chai-as-promised'));
chai.use(require('chai-sorted'));
const sinon = require('sinon');
chai.use(require('sinon-chai'));
const customChaiHelpers = require('./tooling/chai-custom-helpers/index');
_.each(customChaiHelpers, chai.use);
const cache = require('../lib/infrastructure/cache');
const nock = require('nock');

afterEach(async () => {
  airtableBuilder.cleanAll();
  await databaseBuilder.clean();
  cache.flushAll();
  nock.cleanAll();
  return sinon.restore();
});

// Knex
const { knex } = require('../db/knex-database-connection');

// Input Data Builder
const InputOutputDataBuilder = require('./tooling/input-output-data-builder/input-output-data-builder');
const inputOutputDataBuilder = new InputOutputDataBuilder();

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

function streamToPromise(stream) {
  return new Promise((resolve, reject) => {
    let totalData = '';
    stream.on('data', (data) => {
      totalData += data;
    });
    stream.on('end', () => {
      resolve(totalData);
    });
    stream.on('error', reject);
  });
}

// Nock
nock.disableNetConnect();

// airtableBuilder
const AirtableBuilder = require('./tooling/airtable-builder/airtable-builder');
const airtableBuilder = new AirtableBuilder({ nock });

function generateAuthorizationHeader(user) {
  return { authorization: `Bearer ${user.apiKey}` };
}

// Inspired by what is done within chai project itself to test assertions
// https://github.com/chaijs/chai/blob/main/test/bootstrap/index.js
global.chaiErr = function globalErr(fn, val) {
  if (chai.util.type(fn) !== 'function') throw new chai.AssertionError('Invalid fn');

  try {
    fn();
  } catch (err) {
    switch (chai.util.type(val).toLowerCase()) {
      case 'undefined':
        return;
      case 'string':
        return chai.expect(err.message).to.equal(val);
      case 'regexp':
        return chai.expect(err.message).to.match(val);
      case 'object':
        return Object.keys(val).forEach(function(key) {
          chai.expect(err).to.have.property(key).and.to.deep.equal(val[key]);
        });
    }

    throw new chai.AssertionError('Invalid val');
  }

  throw new chai.AssertionError('Expected an error');
};

chai.use(function(chai) {
  const Assertion = chai.Assertion;

  Assertion.addMethod('exactlyContainInOrder', function(expectedElements) {
    const errorMessage = `expect [${this._obj}] to exactly contain in order [${expectedElements}]`;

    new Assertion(this._obj, errorMessage).to.deep.equal(expectedElements);
  });
});

chai.use(function(chai) {
  const Assertion = chai.Assertion;

  Assertion.addMethod('exactlyContain', function(expectedElements) {
    const errorMessage = `expect [${this._obj}] to exactly contain [${expectedElements}]`;
    new Assertion(this._obj, errorMessage).to.deep.have.members(expectedElements);
  });
});

module.exports = {
  airtableBuilder,
  catchErr,
  inputOutputDataBuilder,
  databaseBuilder,
  domainBuilder: require('./tooling/domain-builder/factory'),
  expect,
  generateAuthorizationHeader,
  hFake,
  knex,
  sinon,
  streamToPromise,
  testErr: new Error('Fake Error'),
  testInfraNotFoundErr: new infraErrors.NotFoundError('Fake infra NotFoundError'),
};
