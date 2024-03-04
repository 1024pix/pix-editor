import { PassThrough } from 'node:stream';
import { exportTranslations } from './export-translations.js';
import { Configuration, UploadsApi } from 'phrase-js';
import * as config from '../../config.js';
import { logger } from '../../infrastructure/logger.js';
import { releaseRepository, localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { streamToPromise } from '../../infrastructure/utils/stream-to-promise.js';

export async function uploadTranslationToPhrase(request) {
  const stream = new PassThrough();
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  exportTranslations(stream, { releaseRepository, localizedChallengeRepository, baseUrl });
  const csvFile = new File([await streamToPromise(stream)], 'translations.csv');

  const configuration = new Configuration({
    fetchApi: fetch,
    apiKey: `token ${config.phrase.apiKey}`,
  });

  const requestParameters = {
    projectId: config.phrase.projectId,
    localeId: config.phrase.frLocaleId,
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
  };

  try {
    await new UploadsApi(configuration).uploadCreate(requestParameters);
  } catch (e) {
    const text = await e.text?.() ?? e;
    logger.error(`Phrase error while uploading translations: ${text}`);
    throw new Error('Phrase error', { cause: e });
  }
}