const path = require('path');
const { LOCALE_TO_LANGUAGE_MAP } = require('./domain/constants');

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function _getNumber(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
}

module.exports = (function() {

  const config = {
    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3002,

    environment: (process.env.NODE_ENV || 'development'),

    hapi: {
      options: {},
      enableRequestMonitoring: isFeatureEnabled(process.env.ENABLE_REQUEST_MONITORING),
    },

    airtable: {
      apiKey: process.env.CYPRESS_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY,
      base: process.env.CYPRESS_AIRTABLE_BASE || process.env.AIRTABLE_BASE,
      editorBase: process.env.AIRTABLE_EDITOR_BASE,
    },

    logging: {
      enabled: isFeatureEnabled(process.env.LOG_ENABLED),
      colorEnabled: (process.env.NODE_ENV === 'development'),
      logLevel: (process.env.LOG_LEVEL || 'info'),
      logOpsMetrics: isFeatureEnabled(process.env.LOG_OPS_METRICS),
      emitOpsEventEachSeconds: isFeatureEnabled(process.env.OPS_EVENT_EACH_SECONDS) || 15,
      prettyPrint: isFeatureEnabled(process.env.LOG_PRETTY_PRINT)
    },

    pixApi: {
      baseUrl: process.env.PIX_API_BASEURL,
      user: process.env.PIX_API_USER_EMAIL,
      password: process.env.PIX_API_USER_PASSWORD,
    },

    pixEditor: {
      airtableUrl: process.env.AIRTABLE_URL,
      tableChallenges: process.env.TABLE_CHALLENGES,
      tableSkills: process.env.TABLE_SKILLS,
      tableTubes: process.env.TABLE_TUBES,
      storagePost: process.env.STORAGE_POST,
      storageBucket: process.env.STORAGE_BUCKET,
      localeToLanguageMap: LOCALE_TO_LANGUAGE_MAP,
    },

    storage: {
      authUrl: process.env.STORAGE_AUTH,
      password: process.env.STORAGE_PASSWORD,
      tenant: process.env.STORAGE_TENANT,
      user: process.env.STORAGE_USER,
    },

    sentry: {
      enabled: isFeatureEnabled(process.env.SENTRY_ENABLED),
      dsn: process.env.SENTRY_DSN,
      environment: (process.env.SENTRY_ENVIRONMENT || 'development'),
      maxBreadcrumbs: _getNumber(process.env.SENTRY_MAX_BREADCRUMBS, 100),
      debug: isFeatureEnabled(process.env.SENTRY_DEBUG),
      maxValueLength: 1000,
    },

    scheduledJobs: {
      redisUrl: process.env.REDIS_URL,
      createReleaseTime: process.env.CREATE_RELEASE_TIME,
      attempts: _getNumber(process.env.CREATE_RELEASE_ATTEMPTS, 4),
      startCheckUrlJob: isFeatureEnabled(process.env.START_CHECK_URL_JOB)
    },

    database: {
      url: process.env.DATABASE_URL,
      poolMaxSize: _getNumber(process.env.DATABASE_CONNECTION_POOL_MAX_SIZE, 4),
      asyncStackTraceEnabled: isFeatureEnabled(process.env.KNEX_ASYNC_STACKTRACE_ENABLED),
      sslEnabled: isFeatureEnabled(process.env.DATABASE_SSL_ENABLED),
    },

    notifications: {
      slack: {
        webhookUrl: process.env.NOTIFICATIONS_SLACK_WEBHOOK_URL,
        enable: isFeatureEnabled(process.env.NOTIFICATIONS_SLACK_ENABLE),
      }
    },

    checkUrlsJobs: {
      googleAuthCredentials: JSON.parse(process.env.GOOGLE_AUTH_CREDENTIALS || '{}'),
      spreadsheetId: process.env.CHECK_URLS_SPREADSHEET_ID,
      challengesSheetName: process.env.CHECK_URLS_CHALLENGES_SHEET_NAME,
      tutorialsSheetName: process.env.CHECK_URLS_TUTORIALS_SHEET_NAME,
    }

  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.airtable.apiKey = 'airtableApiKeyValue';
    config.airtable.base = 'airtableBaseValue';
    config.airtable.editorBase = 'airtableEditorBaseValue';

    config.logging.enabled = false;

    config.pixApi = {
      baseUrl: 'https://api.test.pix.fr',
      user: 'adminUser',
      password: '123',
    };

    config.pixEditor = {
      airtableUrl: 'airtableUrlValue',
      tableChallenges: 'tableChallengesValue',
      tableSkills: 'tableSkillsValue',
      tableTubes: 'tableTubesValue',
      storagePost: 'storagePostValue',
      storageBucket: 'storageBucketValue',
    };

    config.storage = {
      authUrl: 'https://storage.auth.example.net/api/auth',
      password: 'storagePassword',
      tenant: 'storageTenant',
      user: 'storageUser',
    };

    config.database.url = process.env.TEST_DATABASE_URL;

    config.scheduledJobs.redisUrl = config.scheduledJobs.redisUrl + '/1';

    config.notifications.slack.webhookUrl = 'https://hooks.slack.com/testUrl';

    config.notifications.slack.enable = false;
  }

  return config;

})();
