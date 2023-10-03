import { knex } from '../../../db/knex-database-connection.js';
import { Challenge } from '../../domain/models/Challenge.js';
import { challengeDatasource } from '../datasources/airtable/index.js';
import { translationRepository } from './index.js';
import { getPrimaryLocaleFromChallenge } from '../translations/challenge.js';

function _getChallengesFromParams(params) {
  if (params.filter && params.filter.ids) {
    return challengeDatasource.filter(params);
  }
  if (params.filter && params.filter.search) {
    return challengeDatasource.search(params);
  }
  return challengeDatasource.list(params);
}

export async function filter(params = {}) {
  let challengeDtos = await _getChallengesFromParams(params);
  return knex.transaction(async (transaction) => {
    return Promise.all(challengeDtos.map(async (challengeDto) => {
      const translations = await translationRepository.listByPrefix(`challenge.${challengeDto.id}.`, { transaction });
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
  const challengeDtos = await challengeDatasource.getAllIdsIn(challengeIds);
  return challengeDtos.map(toDomain);
}

function toDomain(challengeDto, translations) {
  const formattedTranslations = translations.map(({ key, value }) => [ key.split('.').at(-1), value ]);
  return new Challenge({
    ...challengeDto,
    ...Object.fromEntries(formattedTranslations),
  });
}
