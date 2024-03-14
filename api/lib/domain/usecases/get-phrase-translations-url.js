import { Configuration, LocalesApi } from 'phrase-js';
import * as config from '../../config.js';
import { logger } from '../../infrastructure/logger.js';

export async function getPhraseTranslationsURL({ challengeId, locale }, phrase = { Configuration, LocalesApi }) {
  try {
    const locales = await new phrase.LocalesApi(new phrase.Configuration({
      apiKey: `token ${config.phrase.apiKey}`,
      fetchApi: fetch,
    })).localesList({
      projectId: config.phrase.projectId,
    });

    const defaultLocaleId = locales.find(({ _default }) => _default)?.id;
    const targetLocaleId = locales.find(({ code }) => code === locale)?.id;

    const url = new URL(config.phrase.projectId, 'https://app.phrase.com/editor/v4/accounts/00000000000000000000000000000000/projects/');
    url.searchParams.set('search', `keyNameQuery:challenge.${challengeId}`);
    url.searchParams.set('locales', `'${defaultLocaleId}','${targetLocaleId}'`);

    return url.href;
  } catch (e) {
    const text = await e.text?.() ?? e;
    logger.error(`Phrase error while listing locales: ${text}`);
    throw new Error('Phrase error', { cause: e });
  }
}
