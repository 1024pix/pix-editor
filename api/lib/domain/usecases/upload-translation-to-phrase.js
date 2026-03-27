import { PassThrough } from 'node:stream';
import { exportTranslations } from './export-translations.js';
import { Configuration, LocalesApi, UploadsApi } from 'phrase-js';
import * as config from '../../config.js';
import { child } from '../../infrastructure/logger.js';
import { releaseRepository, localizedChallengeRepository, translationsConfigRepository } from '../../infrastructure/repositories/index.js';
import { streamToPromise } from '../../infrastructure/utils/stream-to-promise.js';
import { schedule as scheduleDeleteUnmentionedKeysAfterUploadJob } from '../../infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job.js';

const logger = child('uc:uploadTranslationToPhrase', { event: 'uploadTranslationToPhrase' });

export async function uploadTranslationToPhrase(phraseApi = { Configuration, LocalesApi, UploadsApi }) {
  const { apiKey } = config.phrase;
  const baseUrl = config.lcms.baseUrl;

  if (!apiKey) {
    logger.warn('No Phrase API Key defined, skipping translations upload');
    return;
  }

  const configs = await translationsConfigRepository.list();

  if (!configs.length) {
    logger.warn('No translations config defined, skipping upload translations');
    return;
  }

  const phraseApiConfig = new phraseApi.Configuration({
    fetchApi: fetch,
    apiKey: `token ${apiKey}`,
  });
  const localesApi = new phraseApi.LocalesApi(phraseApiConfig);
  const uploadsApi = new phraseApi.UploadsApi(phraseApiConfig);

  const release = await releaseRepository.getLatestRelease();

  configsLoop: for (const { phraseProjectId, frameworkId, areaId, uploadedLocales: locales } of configs) {
    try {
      const projectLocales = await localesApi.localesList({ projectId: phraseProjectId });

      for (const locale of locales) {
        if (!projectLocales.some(({ code }) => code === locale)) {
          logger.warn({ locale, phraseProjectId }, 'Locale not found for Phrase project');
          continue configsLoop;
        }
      }

      const [firstLocale] = locales;
      const localeId = projectLocales.find(({ code }) => code === firstLocale).id;

      const stream = new PassThrough();
      await exportTranslations(
        stream,
        { frameworkId, areaId, locales },
        { release, localizedChallengeRepository, baseUrl },
      );
      const csvFile = new File([await streamToPromise(stream)], 'translations.csv');

      const upload = await uploadsApi.uploadCreate({
        projectId: phraseProjectId,
        localeId, // FIXME remove?
        file: csvFile,
        fileFormat: 'csv',
        updateDescriptions: true,
        updateTranslations: true,
        skipUploadTags: true,
        localeMapping: Object.fromEntries(locales.map((locale, index) => [locale, 1 + index + 1])),
        formatOptions: {
          key_index: 1,
          tag_column: 1 + locales.length + 1,
          comment_index: 1 + locales.length + 2,
          header_content_row: true,
        },
      });

      await scheduleDeleteUnmentionedKeysAfterUploadJob({
        uploadId: upload.id,
        projectId: phraseProjectId,
      });
    } catch (err) {
      logger.error({ err: (await err.text?.()) ?? err }, 'error while uploading translations to Phrase');
      throw err;
    }
  }
}
