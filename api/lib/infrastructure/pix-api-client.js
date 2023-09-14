import axios from 'axios';
import qs from 'qs';
import { cache } from './cache.js';
import * as config from '../config.js';

export async function request({ payload, url }) {
  return _callAPIWithRetry((token) => {
    return axios.patch(
      `${config.pixApi.baseUrl}${url}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  });
}

async function _callAPIWithRetry(fn, renewToken = false) {
  const token = await _getToken(renewToken);
  try {
    return await fn(token);
  } catch (error) {
    if (error.response && error.response.status === 401 && !renewToken) {
      return _callAPIWithRetry(fn, true);
    } else {
      throw error;
    }
  }
}

async function _authenticate() {
  const data = qs.stringify({
    username: config.pixApi.user,
    password: config.pixApi.password,
    grant_type: 'password',
  });

  const response = await axios.post(
    `${config.pixApi.baseUrl}/api/token`,
    data,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  cache.set('pix-api-token', response.data.access_token);

  return response.data.access_token;
}

function _getToken(renewToken) {
  if (renewToken) {
    return _authenticate();
  }
  return cache.get('pix-api-token') || _authenticate();
}
