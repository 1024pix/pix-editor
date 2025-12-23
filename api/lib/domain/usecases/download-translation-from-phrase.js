import { Readable } from 'node:stream';
import { Configuration, LocalesApi } from 'phrase-js';

import * as config from '../../config.js';
import { logger } from '../../infrastructure/logger.js';
import { importTranslations } from './import-translations.js';
import { parseTranslationsCsvStream } from '../services/parse-translations-csv-stream.js';

export async function downloadTranslationFromPhrase(phraseApi = { Configuration, LocalesApi }) {
  const { apiKey, projects } = config.phrase;

  if (!apiKey || !projects.length) {
    logger.info("Phrase API Key or Projects is empty or doesn't contain areaCode. Skipping download translations.");
    return;
  }
  const configuration = new phraseApi.Configuration({
    fetchApi: fetch,
    apiKey: `token ${apiKey}`,
  });

  for (const { projectId } of projects) {
    try {
      const localesApi = new phraseApi.LocalesApi(configuration);

      const phraseLocales = await localesApi.localesList({ projectId });

      for (const phraseLocale of phraseLocales) {
        if (phraseLocale._default) continue;

        const csvFile = await localesApi.localeDownload({
          projectId,
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
