import { Configuration, LocalesApi } from 'phrase-js';
import * as config from '../../config.js';
import { logger } from '../../infrastructure/logger.js';
import { importTranslations } from './import-translations.js';
import { Readable } from 'node:stream';

export async function downloadTranslationFromPhrase(phraseApi = { Configuration, LocalesApi }) {

  const { apiKey, projectId } = config.phrase;

  if (!apiKey || !projectId) {
    logger.info('Phrase API Key or Project Id is not defined. Skipping download translations.');
    return;
  }

  const configuration = new phraseApi.Configuration({
    fetchApi: fetch,
    apiKey: `token ${apiKey}`,
  });

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
      await importTranslations(Readable.fromWeb(csvFile.stream()));
    }
  } catch (e) {
    const text = await e.text?.() ?? e;
    logger.error(`Error while downloading translations: ${text}`);
    throw new Error('Download error', { cause: e });
  }
}
