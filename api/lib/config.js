import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALE_TO_LANGUAGE_MAP, TUTORIAL_LOCALE_TO_LANGUAGE_MAP } from './domain/constants.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

function _getNumber(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
}

function _getStringArray(stringWithCommas, defaultStringArray) {
  if (stringWithCommas) {
    return stringWithCommas.split(',');
  }
  return defaultStringArray;
}

function _getLogForHumans() {
  const processOutputingToTerminal = process.stdout.isTTY;
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === 'false';
  return processOutputingToTerminal && !forceJSONLogs;
}

export const rootPath = path.normalize(__dirname + '/..');

export let port = parseInt(process.env.PORT, 10) || 3002;

export const environment = process.env.NODE_ENV || 'development';

export const hapi = {
  options: {},
  enableRequestMonitoring: isFeatureEnabled(process.env.ENABLE_REQUEST_MONITORING),
  publicDir: 'public/',
  shouldCompressLargeJson: isFeatureEnabled(process.env.ALLOW_COMPRESSION_ON_LARGE_JSON),
};

export const airtable = {
  apiKey: process.env.CYPRESS_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY,
  editorBase: process.env.AIRTABLE_EDITOR_BASE,
};

export const logging = {
  enabled: isFeatureEnabled(process.env.LOG_ENABLED),
  colorEnabled: process.env.NODE_ENV === 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  logOpsMetrics: isFeatureEnabled(process.env.LOG_OPS_METRICS),
  emitOpsEventEachSeconds: isFeatureEnabled(process.env.OPS_EVENT_EACH_SECONDS) || 15,
  debugSections: process.env.LOG_DEBUG?.split(',') ?? [],
  logForHumans: _getLogForHumans(),
  logForHumansCompactFormat: process.env.LOG_FOR_HUMANS_FORMAT === 'compact',
};

export let pixApi = {
  baseUrl: process.env.PIX_API_BASEURL,
  user: process.env.PIX_API_USER_EMAIL,
  password: process.env.PIX_API_USER_PASSWORD,
};

export let pixApp = {
  baseUrlFr: process.env.PIX_APP_BASEURL_FR ?? process.env.PIX_APP_BASEURL,
  baseUrlOrg: process.env.PIX_APP_BASEURL_ORG ?? process.env.PIX_APP_BASEURL,
};

export const lcms = { baseUrl: process.env.PIX_EDITOR_BASE_URL };

export const pixEditor = {
  storagePost: process.env.STORAGE_POST,
  storageBucket: process.env.STORAGE_BUCKET,
  localeToLanguageMap: LOCALE_TO_LANGUAGE_MAP,
  tutorialLocaleToLanguageMap: TUTORIAL_LOCALE_TO_LANGUAGE_MAP,
};

export let storage = {
  authUrl: process.env.STORAGE_AUTH,
  password: process.env.STORAGE_PASSWORD,
  tenant: process.env.STORAGE_TENANT,
  user: process.env.STORAGE_USER,
};

export const scheduledJobs = {
  redisUrl: process.env.REDIS_URL,
  createReleaseTime: process.env.CREATE_RELEASE_TIME,
  exportExternalUrlListTime: process.env.EXPORT_EXTERNAL_URL_LIST_TIME,
  attempts: _getNumber(process.env.CREATE_RELEASE_ATTEMPTS, 4),
  startCheckUrlJob: isFeatureEnabled(process.env.START_CHECK_URL_JOB),
  cleanReleasesTableTime: process.env.CLEAN_RELEASES_TABLE_TIME,
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

export const googleAuthCredentials = JSON.parse(process.env.GOOGLE_AUTH_CREDENTIALS || '{}');

export const checkUrlsJobs = {
  spreadsheetId: process.env.CHECK_URLS_SPREADSHEET_ID,
  challengesSheetName: process.env.CHECK_URLS_CHALLENGES_SHEET_NAME,
  tutorialsSheetName: process.env.CHECK_URLS_TUTORIALS_SHEET_NAME,
};

export const exportExternalUrlsJob = { spreadsheetId: process.env.EXPORT_EXTERNAL_URLS_LIST_SPREADSHEET_ID };

export const phrase = {
  apiKey: process.env.PHRASE_API_KEY,
  projects: [
    {
      frameworkName: 'Pix',
      areaCode: 1,
      projectId: process.env.PHRASE_PIX_FIRST_AREA_PROJECT_ID,
    },
    {
      frameworkName: 'Pix',
      areaCode: 2,
      projectId: process.env.PHRASE_PIX_SECOND_AREA_PROJECT_ID,
    },
    {
      frameworkName: 'Pix',
      areaCode: 3,
      projectId: process.env.PHRASE_PIX_THIRD_AREA_PROJECT_ID,
    },
    {
      frameworkName: 'Pix',
      areaCode: 4,
      projectId: process.env.PHRASE_PIX_FOURTH_AREA_PROJECT_ID,
    },
    {
      frameworkName: 'Pix',
      areaCode: 5,
      projectId: process.env.PHRASE_PIX_FIFTH_AREA_PROJECT_ID,
    },
    {
      frameworkName: 'Numérique Responsable',
      projectId: process.env.PHRASE_PIX_NR_PROJECT_ID,
    },
  ].filter(({ projectId }) => projectId),
};

export const importTranslationsFileMaxSize = process.env.IMPORT_TRANSLATIONS_FILE_MAX_SIZE || 2097152;

export const seedsConfig = {
  cntFrameworks: _getNumber(process.env.AIRTABLE_SEEDS_CNT_FRAMEWORKS, 2),
  cntAreasPerFramework: _getNumber(process.env.AIRTABLE_SEEDS_CNT_AREAS, 2),
  cntCompetencesPerArea: _getNumber(process.env.AIRTABLE_SEEDS_CNT_COMPETENCES, 2),
  cntThematicsPerCompetence: _getNumber(process.env.AIRTABLE_SEEDS_CNT_THEMATICS, 2),
  cntTubesPerThematic: _getNumber(process.env.AIRTABLE_SEEDS_CNT_TUBES, 2),
  skillMaxLevel: _getNumber(process.env.AIRTABLE_SEEDS_SKILL_LEVEL, 3),
  locales: _getStringArray(process.env.AIRTABLE_SEEDS_LOCALES, ['fr', 'en']),
};

if (process.env.NODE_ENV === 'test') {
  port = 0;
  hapi.publicDir = 'tests/public-tests/';

  airtable.apiKey = 'airtableApiKeyValue';
  airtable.editorBase = 'airtableEditorBaseValue';

  logging.enabled = false;

  pixApi = {
    baseUrl: 'https://api.test.pix.fr',
    user: 'adminUser',
    password: '123',
  };

  pixEditor.storagePost = 'https://url-de-mon-storage.com/v1/AUTH_blabla/local-app/';
  pixEditor.storageBucket = 'mon-bucket-local';

  pixApp = {
    baseUrlFr: 'https://app.test.pix.fr',
    baseUrlOrg: 'https://app.test.pix.org',
  };

  lcms.baseUrl = 'http://test.site';

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

  phrase.apiKey = 'MY_PHRASE_ACCESS_TOKEN';
  phrase.projects = [{ projectId: 'MY_PHRASE_PROJECT_ID', frameworkName: 'Pix' }];
}
