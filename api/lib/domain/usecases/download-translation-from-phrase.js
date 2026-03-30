import { Readable } from 'node:stream';
import { Configuration, LocalesApi } from 'phrase-js';

import * as config from '../../config.js';
import { child } from '../../infrastructure/logger.js';
import { importTranslations } from './import-translations.js';
import { parseTranslationsCsvStream } from '../services/parse-translations-csv-stream.js';
import { translationsConfigRepository } from '../../infrastructure/repositories/index.js';

const logger = child('uc:downloadTranslationFromPhrase', { event: 'downloadTranslationFromPhrase' });

export async function downloadTranslationFromPhrase(phraseApi = { Configuration, LocalesApi }) {
  const { apiKey } = config.phrase;

  if (!apiKey) {
    logger.warn('No Phrase API Key defined, skipping translations upload');
    return;
  }

  const configs = await translationsConfigRepository.list();

  if (!configs.length) {
    logger.warn('No translations config defined, skipping upload translations');
    return;
  }

  const configuration = new phraseApi.Configuration({
    fetchApi: fetch,
    apiKey: `token ${apiKey}`,
  });

  for (const { phraseProjectId, uploadedLocales } of configs) {
    try {
      const localesApi = new phraseApi.LocalesApi(configuration);

      const phraseLocales = await localesApi.localesList({ projectId: phraseProjectId });

      for (const phraseLocale of phraseLocales) {
        if (uploadedLocales.includes(phraseLocale.name)) {
          logger.debug({ locale: { id: phraseLocale.id, name: phraseLocale.name } }, 'Skipping uploaded locale');
          continue;
        }

        logger.info({ locale: { id: phraseLocale.id, name: phraseLocale.name } }, 'Downloading locale from Phrase');

        const csvFile = await localesApi.localeDownload({
          projectId: phraseProjectId,
          id: phraseLocale.id,
          fileFormat: 'csv',
        });

        const translations = await parseTranslationsCsvStream(Readable.fromWeb(csvFile.stream()));

        await importTranslations(translations);
      }
    } catch (e) {
      const text = (await e.text?.()) ?? e;
      logger.error(`Error while downloading translations: ${text}`);
      throw new Error('Download error', { cause: e });
    }
  }
}
