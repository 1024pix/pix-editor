import * as infraErrors from '../lib/infrastructure/errors.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiSorted from 'chai-sorted';
import sinonChai from 'sinon-chai';
import _ from 'lodash';
import * as customChaiHelpers from './tooling/chai-custom-helpers/index.js';
import { cache } from '../lib/infrastructure/cache.js';
import nock from 'nock';
import { DatabaseBuilder } from './tooling/database-builder/database-builder.js';
import { AirtableBuilder } from './tooling/airtable-builder/airtable-builder.js';
import { InputOutputDataBuilder }  from './tooling/input-output-data-builder/input-output-data-builder.js';
import { knex } from '../db/knex-database-connection.js';

import * as sinon from 'sinon';
export { sinon };

chai.use(chaiAsPromised);
chai.use(chaiSorted);
chai.use(sinonChai);
_.each(customChaiHelpers, chai.use);

export { expect } from 'chai';

afterEach(async () => {
  airtableBuilder.cleanAll();
  await databaseBuilder.clean();
  cache.flushAll();
  nock.cleanAll();
  return sinon.restore();
});

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

export function streamToPromise(stream) {
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
export const airtableBuilder = new AirtableBuilder({ nock });

export function generateAuthorizationHeader(user) {
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

export { domainBuilder } from './tooling/domain-builder/domain-builder.js';

export const testErr = new Error('Fake Error');
export const testInfraNotFoundErr = new infraErrors.NotFoundError('Fake infra NotFoundError');
