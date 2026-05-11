import qs from 'qs';
import { cache } from './cache.js';
import * as config from '../config.js';
import { logger } from './logger.js';

export async function request({ payload, url }) {
  return _callAPIWithRetry(async (token) => {
    return fetch(`${config.pixApi.baseUrl}${url}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    });
  });
}

export function isPixApiCachePatchingEnabled() {
  const enabled = config.pixApi.baseUrl !== undefined;

  if (!enabled) {
    logger.info('No base URL defined for Pix API, LCMS cache patching is disabled');
  }

  return enabled;
}

async function _callAPIWithRetry(fn, renewToken = false) {
  const token = await _getToken(renewToken);
  const response = await fn(token);
  if (response.status === 401 && !renewToken) return _callAPIWithRetry(fn, true);
  if (!response.ok) throw new Error('something went wrong when reaching PixAPI Client', response.status);
}

async function _authenticate() {
  const data = qs.stringify({
    username: config.pixApi.user,
    password: config.pixApi.password,
    grant_type: 'password',
  });

  const response = await fetch(`${config.pixApi.baseUrl}/api/token`, {
    method: 'POST',
    body: data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!response.ok) throw new Error('fetching token to pix API failed', response.status);

  const jsonResponse = await response.json();

  cache.set('pix-api-token', jsonResponse.access_token);

  return jsonResponse.access_token;
}

function _getToken(renewToken) {
  if (renewToken) {
    return _authenticate();
  }
  return cache.get('pix-api-token') || _authenticate();
}
