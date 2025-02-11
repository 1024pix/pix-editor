import 'dotenv/config';

export let port = parseInt(process.env.PORT, 10) || 2005;
export const environment = (process.env.NODE_ENV || 'development');

export const hapi = {
  options: {},
  enableRequestMonitoring: false,
  publicDir: 'public/',
};

export const lcms = {
  baseUrl: process.env.LCMS_API_URL,
  token: process.env.LCMS_API_KEY,
};

if (process.env.NODE_ENV === 'test') {
  port = 0;
  hapi.publicDir = 'tests/public-tests/';
  lcms.baseUrl = 'http://lcms-test.test';
  lcms.token = 'TEST_TOKEN';
}
