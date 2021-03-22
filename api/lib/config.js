const path = require('path');

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
      options: {}
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
      storageTenant: process.env.STORAGE_TENANT,
      storageUser: process.env.STORAGE_USER,
      storagePassword: process.env.STORAGE_PASSWORD,
      storageKey: process.env.STORAGE_KEY,
      storageAuth: process.env.STORAGE_AUTH,
      storageBucket: process.env.STORAGE_BUCKET,
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
    },
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
      storageTenant: 'storageTenantValue',
      storageUser: 'storageUserValue',
      storagePassword: 'storagePasswordValue',
      storageKey: 'storageKeyValue',
      storageAuth: 'storageAuthValue',
      storageBucket: 'storageBucketValue',
    };

    config.storage = {
      authUrl: 'https://storage.auth.example.net/api/auth',
      password: 'storagePassword',
      tenant: 'storageTenant',
      user: 'storageUser',
    };
  }

  return config;

})();
