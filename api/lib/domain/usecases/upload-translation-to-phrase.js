import { PassThrough } from 'node:stream';
import { exportTranslations } from './export-translations.js';
import { Configuration, LocalesApi, UploadsApi } from 'phrase-js';
import * as config from '../../config.js';
import { logger } from '../../infrastructure/logger.js';
import { releaseRepository, localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { streamToPromise } from '../../infrastructure/utils/stream-to-promise.js';
import { schedule as scheduleDeleteUnmentionedKeysAfterUploadJob } from '../../infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job.js';

export async function uploadTranslationToPhrase(phraseApi = { Configuration, LocalesApi, UploadsApi }) {

  const { apiKey, projectId } = config.phrase;

  if (!apiKey || !projectId) {
    logger.info('Phrase API Key or Project Id is not defined. Skipping upload translations.');
    return;
  }

  const baseUrl = config.lcms.baseUrl;
  const stream = new PassThrough();
  exportTranslations(stream, { releaseRepository, localizedChallengeRepository, baseUrl });
  const csvFile = new File([await streamToPromise(stream)], 'translations.csv');

  const configuration = new phraseApi.Configuration({
    fetchApi: fetch,
    apiKey: `token ${config.phrase.apiKey}`,
  });

  try {
    const locales = await new phraseApi.LocalesApi(configuration).localesList({
      projectId: config.phrase.projectId,
    });

    const defaultLocaleId = locales.find((locale) => locale._default)?.id;

    const upload = await new phraseApi.UploadsApi(configuration).uploadCreate({
      projectId: config.phrase.projectId,
      localeId: defaultLocaleId,
      file: csvFile,
      fileFormat: 'csv',
      updateDescriptions: true,
      updateTranslations: true,
      skipUploadTags: true,
      localeMapping: {
        fr: 2,
      },
      formatOptions: {
        key_index: 1,
        tag_column: 3,
        comment_index: 4,
        header_content_row: true,
      }
    });
    scheduleDeleteUnmentionedKeysAfterUploadJob({ uploadId: upload.id });
  } catch (e) {
    const text = await e.text?.() ?? e;
    logger.error(`Phrase error while uploading translations: ${text}`);
    throw new Error('Phrase error', { cause: e });
  }
}
