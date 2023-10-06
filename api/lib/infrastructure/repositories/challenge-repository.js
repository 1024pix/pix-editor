import { knex } from '../../../db/knex-database-connection.js';
import { Challenge } from '../../domain/models/Challenge.js';
import { challengeDatasource } from '../datasources/airtable/index.js';
import { translationRepository } from './index.js';
import { prefix, prefixFor, getPrimaryLocaleFromChallenge } from '../translations/challenge.js';

function _getChallengesFromParams(params) {
  if (params.filter && params.filter.ids) {
    return challengeDatasource.filter(params);
  }
  if (params.filter && params.filter.search) {
    return challengeDatasource.search(params);
  }
  return challengeDatasource.list(params);
}

export async function list() {
  const [challenges, translations] = await Promise.all([
    challengeDatasource.list(),
    translationRepository.listByPrefix(prefix),
  ]);
  return challenges.map((challengeDto) => {
    const challengeLocale = getPrimaryLocaleFromChallenge(challengeDto.locales) ?? 'fr';
    const filteredTranslations = translations.filter(({ key, locale }) => key.startsWith(prefixFor(challengeDto)) && locale === challengeLocale);
    return toDomain(challengeDto, filteredTranslations);
  });
}

export async function filter(params = {}) {
  const challengeDtos = await _getChallengesFromParams(params);
  return knex.transaction(async (transaction) => {
    return Promise.all(challengeDtos.map(async (challengeDto) => {
      const translations = await translationRepository.listByPrefix(prefixFor(challengeDto), { transaction });
      const challengeLocale = getPrimaryLocaleFromChallenge(challengeDto.locales) ?? 'fr';
      const filteredTranslations = translations.filter(({ locale }) => locale === challengeLocale);
      return toDomain(challengeDto, filteredTranslations);
    }));
  }, { readOnly: true });
}

export function create(challenge) {
  return challengeDatasource.create(challenge);
}

export function update(challenge) {
  return challengeDatasource.update(challenge);
}

export async function getAllIdsIn(challengeIds) {
  return challengeDatasource.getAllIdsIn(challengeIds);
}

function toDomain(challengeDto, translations) {
  const formattedTranslations = translations.map(({ key, value }) => [ key.split('.').at(-1), value ]);
  return new Challenge({
    ...challengeDto,
    ...Object.fromEntries(formattedTranslations),
  });
}
