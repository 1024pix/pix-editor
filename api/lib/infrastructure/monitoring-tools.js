import * as config from '../config.js';
import _ from 'lodash';
import { logger } from '../infrastructure/logger.js';
import HapiRequest from '@hapi/hapi/lib/request.js';

import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

export function logInfoWithCorrelationIds(data) {
  if (config.hapi.enableRequestMonitoring) {
    const context = asyncLocalStorage.getStore();
    const request = _.get(context, 'request');
    logger.info({
      user_id: extractUserIdFromRequest(request),
      request_id: `${_.get(request, 'info.id', '-')}`,
      ..._.get(data, 'metrics', {}),
    }, _.get(data, 'message', '-'));
  } else {
    logger.info({
      ..._.get(data, 'metrics', {}),
    }, _.get(data, 'message', '-'));
  }
}

export function logErrorWithCorrelationIds(error) {
  if (config.hapi.enableRequestMonitoring) {
    const context = asyncLocalStorage.getStore();
    const request = _.get(context, 'request');
    logger.error({
      user_id: extractUserIdFromRequest(request),
      request_id: `${_.get(request, 'info.id', '-')}`,
    }, error);
  } else {
    logger.error(error);
  }
}

export function extractUserIdFromRequest(request) {
  return _.get(request, 'auth.credentials.user.id', ('-'));
}

export function getInContext(path, value) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  return _.get(store, path, value);
}

export function setInContext(path, value) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  _.set(store, path, value);
}

export function incrementInContext(path) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  _.update(store, path, (v) => (v) ? (v + 1) : 1);
}

export function getContext() {
  return asyncLocalStorage.getStore();
}

export function pushInContext(path, value) {
  const store = asyncLocalStorage.getStore();
  if (!store) return;
  let array = _.get(store, path);
  if (!array) {
    array = [value];
    _.set(store, path, array);
  } else {
    array.push(value);
  }
}

export function installHapiHook() {
  if (!config.hapi.enableRequestMonitoring) return;

  const originalMethod = HapiRequest.prototype._execute;

  if (!originalMethod) {
    throw new Error('Hapi method Request.prototype._execute not found while patch');
  }

  HapiRequest.prototype._execute = function(...args) {
    const request = this;
    const context = { request };
    return asyncLocalStorage.run(context, () => originalMethod.call(request, args));
  };
}
