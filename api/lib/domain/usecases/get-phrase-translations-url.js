import { AccountsApi, Configuration, LocalesApi } from 'phrase-js';
import * as config from '../../config.js';
import { logger } from '../../infrastructure/logger.js';

export async function getPhraseTranslationsURL(
  { challengeId, locale, areaCode, frameworkName },
  phrase = { AccountsApi, Configuration, LocalesApi },
) {
  try {
    const configuration = new phrase.Configuration({
      apiKey: `token ${config.phrase.apiKey}`,
      fetchApi: fetch,
    });

    const accounts = await new phrase.AccountsApi(configuration).accountsList({ page: 1 });

    const accountId = accounts.find(({ name }) => name === 'Pix')?.id;
    const projectId = config.phrase.projects.find(byAreaCodeAndFrameworkName(areaCode, frameworkName)).projectId;

    const locales = await new phrase.LocalesApi(configuration).localesList({ projectId });

    const defaultLocaleId = locales.find(({ _default }) => _default)?.id;
    const targetLocaleId = locales.find(({ code }) => code === locale)?.id;

    const url = new URL(projectId, `https://app.phrase.com/editor/v4/accounts/${accountId}/projects/`);
    url.searchParams.set('search', `keyNameQuery:challenge.${challengeId}`);
    url.searchParams.set('locales', `'${defaultLocaleId}','${targetLocaleId}'`);

    return url.href;
  } catch (e) {
    const text = (await e.text?.()) ?? e;
    logger.error(`Phrase error while listing locales: ${text}`);
    throw new Error('Phrase error', { cause: e });
  }
}

function byAreaCodeAndFrameworkName(areaCode, frameworkName) {
  return (project) => {
    if (project.areaCode) {
      return project.areaCode === areaCode && project.frameworkName === frameworkName;
    }
    return project.frameworkName === frameworkName;
  };
}
