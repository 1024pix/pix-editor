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

  for (const { phraseProjectId, frameworkId, areaId, uploadedLocales: [locale] } of configs) {
    const stream = new PassThrough();
    await exportTranslations(stream, { frameworkId, areaId, locale }, { release, localizedChallengeRepository, baseUrl });
    const csvFile = new File([await streamToPromise(stream)], 'translations.csv');

    try {
      const projectLocales = await localesApi.localesList({ projectId: phraseProjectId });
      const localeId = projectLocales.find(({ code }) => code === locale)?.id;

      if (!localeId) {
        logger.warn({ locale, phraseProjectId }, 'Locale not found for Phrase project');
        continue;
      }

      const upload = await uploadsApi.uploadCreate({
        projectId: phraseProjectId,
        localeId,
        file: csvFile,
        fileFormat: 'csv',
        updateDescriptions: true,
        updateTranslations: true,
        skipUploadTags: true,
        localeMapping: { [locale]: 2 },
        formatOptions: {
          key_index: 1,
          tag_column: 3,
          comment_index: 4,
          header_content_row: true,
        },
      });

      await scheduleDeleteUnmentionedKeysAfterUploadJob({
        uploadId: upload.id,
        projectId: phraseProjectId,
      });
    } catch (e) {
      const text = (await e.text?.()) ?? e;
      logger.error(`Phrase error while uploading translations: ${text}`);
      throw new Error('Phrase error', { cause: e });
    }
  }
}
