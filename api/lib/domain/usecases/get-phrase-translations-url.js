import { AccountsApi, Configuration, LocalesApi } from 'phrase-js';
import * as config from '../../config.js';
import { LOCALE } from '../constants.js';
import { logger } from '../../infrastructure/logger.js';
import { areaRepository, translationsConfigRepository } from '../../infrastructure/repositories/index.js';

const PIX_TO_PHRASE_LOCALE_CODE = Object.freeze({ [LOCALE.GERMAN_AUSTRIA]: LOCALE.GERMAN_SPOKEN });

export function toPhraseLocaleCode(locale) {
  return PIX_TO_PHRASE_LOCALE_CODE[locale] ?? locale;
}

export async function getPhraseTranslationsURL(
  { challengeId, locale },
  phrase = { AccountsApi, Configuration, LocalesApi },
) {
  try {
    const area = await areaRepository.getByChallengeId(challengeId);
    const configs = await translationsConfigRepository.listWithPhraseProjectId();

    const configuration = new phrase.Configuration({
      apiKey: `token ${config.phrase.apiKey}`,
      fetchApi: fetch,
    });

    const accounts = await new phrase.AccountsApi(configuration).accountsList({ page: 1 });

    const accountId = accounts.find(({ name }) => name === 'Pix')?.id;
    const { phraseProjectId } = configs.find((config) => config.frameworkId === area.frameworkId && (config.areaId === null || config.areaId === area.id));

    const locales = await new phrase.LocalesApi(configuration).localesList({ projectId: phraseProjectId });

    const defaultLocaleId = locales.find(({ _default }) => _default)?.id;
    const phraseLocaleCode = toPhraseLocaleCode(locale);
    const targetLocaleId = locales.find(({ code }) => code === phraseLocaleCode)?.id;

    const url = new URL(phraseProjectId, `https://app.phrase.com/editor/v4/accounts/${accountId}/projects/`);
    url.searchParams.set('search', `keyNameQuery:challenge.${challengeId}`);
    if (targetLocaleId) {
      url.searchParams.set('locales', `'${defaultLocaleId}','${targetLocaleId}'`);
    } else {
      logger.warn({ locale, phraseLocaleCode, phraseProjectId }, 'Phrase locale not found, link will not be filtered on locale');
    }

    return url.href;
  } catch (e) {
    const text = (await e.text?.()) ?? e;
    logger.error(`Phrase error while listing locales: ${text}`);
    throw new Error('Phrase error', { cause: e });
  }
}
