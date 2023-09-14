import * as dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALE_TO_LANGUAGE_MAP } from './domain/constants.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

dotenv.config();

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function _getNumber(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
}

export const rootPath = path.normalize(__dirname + '/..');

export let port = parseInt(process.env.PORT, 10) || 3002;

export const environment = (process.env.NODE_ENV || 'development');

export const hapi = {
  options: {},
  enableRequestMonitoring: isFeatureEnabled(process.env.ENABLE_REQUEST_MONITORING),
  publicDir: 'public/',
};

export const airtable = {
  apiKey: process.env.CYPRESS_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY,
  base: process.env.CYPRESS_AIRTABLE_BASE || process.env.AIRTABLE_BASE,
  editorBase: process.env.AIRTABLE_EDITOR_BASE,
};

export const logging = {
  enabled: isFeatureEnabled(process.env.LOG_ENABLED),
  colorEnabled: (process.env.NODE_ENV === 'development'),
  logLevel: (process.env.LOG_LEVEL || 'info'),
  logOpsMetrics: isFeatureEnabled(process.env.LOG_OPS_METRICS),
  emitOpsEventEachSeconds: isFeatureEnabled(process.env.OPS_EVENT_EACH_SECONDS) || 15,
  prettyPrint: isFeatureEnabled(process.env.LOG_PRETTY_PRINT)
};

export let pixApi = {
  baseUrl: process.env.PIX_API_BASEURL,
  user: process.env.PIX_API_USER_EMAIL,
  password: process.env.PIX_API_USER_PASSWORD,
};

export let pixEditor = {
  airtableUrl: process.env.AIRTABLE_URL,
  airtableBase: process.env.AIRTABLE_BASE,
  tableChallenges: process.env.TABLE_CHALLENGES,
  tableSkills: process.env.TABLE_SKILLS,
  tableTubes: process.env.TABLE_TUBES,
  storagePost: process.env.STORAGE_POST,
  storageBucket: process.env.STORAGE_BUCKET,
  localeToLanguageMap: LOCALE_TO_LANGUAGE_MAP,
};

export let storage = {
  authUrl: process.env.STORAGE_AUTH,
  password: process.env.STORAGE_PASSWORD,
  tenant: process.env.STORAGE_TENANT,
  user: process.env.STORAGE_USER,
};

export const sentry = {
  enabled: isFeatureEnabled(process.env.SENTRY_ENABLED),
  dsn: process.env.SENTRY_DSN,
  environment: (process.env.SENTRY_ENVIRONMENT || 'development'),
  maxBreadcrumbs: _getNumber(process.env.SENTRY_MAX_BREADCRUMBS, 100),
  debug: isFeatureEnabled(process.env.SENTRY_DEBUG),
  maxValueLength: 1000,
};

export const scheduledJobs = {
  redisUrl: process.env.REDIS_URL,
  createReleaseTime: process.env.CREATE_RELEASE_TIME,
  attempts: _getNumber(process.env.CREATE_RELEASE_ATTEMPTS, 4),
  startCheckUrlJob: isFeatureEnabled(process.env.START_CHECK_URL_JOB)
};

export const database = {
  url: process.env.DATABASE_URL,
  poolMinSize: _getNumber(process.env.DATABASE_CONNECTION_POOL_MIN_SIZE, 0),
  poolMaxSize: _getNumber(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE, 4),
  asyncStackTraceEnabled: isFeatureEnabled(process.env.KNEX_ASYNC_STACKTRACE_ENABLED),
  sslEnabled: isFeatureEnabled(process.env.DATABASE_SSL_ENABLED),
};

export const notifications = {
  slack: {
    webhookUrl: process.env.NOTIFICATIONS_SLACK_WEBHOOK_URL,
    enable: isFeatureEnabled(process.env.NOTIFICATIONS_SLACK_ENABLE),
  },
};

export const checkUrlsJobs = {
  googleAuthCredentials: JSON.parse(process.env.GOOGLE_AUTH_CREDENTIALS || '{}'),
  spreadsheetId: process.env.CHECK_URLS_SPREADSHEET_ID,
  challengesSheetName: process.env.CHECK_URLS_CHALLENGES_SHEET_NAME,
  tutorialsSheetName: process.env.CHECK_URLS_TUTORIALS_SHEET_NAME,
};

if (process.env.NODE_ENV === 'test') {
  port = 0;
  hapi.publicDir = 'tests/public-tests/';

  airtable.apiKey = 'airtableApiKeyValue';
  airtable.base = 'airtableBaseValue';
  airtable.editorBase = 'airtableEditorBaseValue';

  logging.enabled = false;

  pixApi = {
    baseUrl: 'https://api.test.pix.fr',
    user: 'adminUser',
    password: '123',
  };

  pixEditor = {
    airtableUrl: 'airtableUrlValue',
    tableChallenges: 'tableChallengesValue',
    tableSkills: 'tableSkillsValue',
    tableTubes: 'tableTubesValue',
    storagePost: 'storagePostValue',
    storageBucket: 'storageBucketValue',
  };

  storage = {
    authUrl: 'https://storage.auth.example.net/api/auth',
    password: 'storagePassword',
    tenant: 'storageTenant',
    user: 'storageUser',
  };

  database.url = process.env.TEST_DATABASE_URL;

  scheduledJobs.redisUrl = scheduledJobs.redisUrl + '/1';

  notifications.slack.webhookUrl = 'https://hooks.slack.com/testUrl';

  notifications.slack.enable = false;
}
