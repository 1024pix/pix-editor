const axios = require('axios');
const qs = require('qs');
const cache = require('./cache');
const config = require('../config');

module.exports = {
  async request({ payload, url }) {
    const token = await _getToken();
    return axios.patch(
      `${config.pixApi.baseUrl}${url}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};

async function _authenticate() {
  const data = qs.stringify({
    username: config.pixApi.user,
    password: config.pixApi.password,
  });

  const response = await axios.post(
    `${config.pixApi.baseUrl}/api/token`,
    data,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  cache.set('pix-api-token', response.data.access_token);

  return response.data.access_token;
}

function _getToken() {
  return cache.get('pix-api-token') || _authenticate();
}
