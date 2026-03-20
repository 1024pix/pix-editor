import { AccountsApi, Configuration, LocalesApi } from 'phrase-js';
import * as config from '../../config.js';
import { logger } from '../../infrastructure/logger.js';
import { areaRepository, translationsConfigRepository } from '../../infrastructure/repositories/index.js';

export async function getPhraseTranslationsURL(
  { challengeId, locale },
  phrase = { AccountsApi, Configuration, LocalesApi },
) {
  try {
    const area = await areaRepository.getByChallengeId(challengeId);
    const configs = await translationsConfigRepository.list();

    const configuration = new phrase.Configuration({
      apiKey: `token ${config.phrase.apiKey}`,
      fetchApi: fetch,
    });

    const accounts = await new phrase.AccountsApi(configuration).accountsList({ page: 1 });

    const accountId = accounts.find(({ name }) => name === 'Pix')?.id;
    const { phraseProjectId } = configs.find((config) => config.frameworkId === area.frameworkId && (config.areaId === null || config.areaId === area.id));

    const locales = await new phrase.LocalesApi(configuration).localesList({ projectId: phraseProjectId });

    const defaultLocaleId = locales.find(({ _default }) => _default)?.id;
    const targetLocaleId = locales.find(({ code }) => code === locale)?.id;

    const url = new URL(phraseProjectId, `https://app.phrase.com/editor/v4/accounts/${accountId}/projects/`);
    url.searchParams.set('search', `keyNameQuery:challenge.${challengeId}`);
    url.searchParams.set('locales', `'${defaultLocaleId}','${targetLocaleId}'`);

    return url.href;
  } catch (e) {
    const text = (await e.text?.()) ?? e;
    logger.error(`Phrase error while listing locales: ${text}`);
    throw new Error('Phrase error', { cause: e });
  }
}
