import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { Challenge } from '../../domain/models/Challenge.js';
import { challengeDatasource } from '../datasources/airtable/index.js';
import { translationRepository } from './index.js';
import { prefix, prefixFor, getPrimaryLocaleFromChallenge } from '../translations/challenge.js';

async function _getChallengesFromParams(params) {
  if (params.filter && params.filter.ids) {
    return challengeDatasource.filter(params);
  }
  if (params.filter && params.filter.search) {
    params.filter.ids = await translationRepository.search({
      entity: 'challenge',
      fields: ['instruction', 'proposals'],
      search: params.filter.search,
      limit: params.page?.size,
    });
    return challengeDatasource.search(params);
  }
  return challengeDatasource.list(params);
}

export async function list() {
  const [challengeDtos, translations] = await Promise.all([
    challengeDatasource.list(),
    translationRepository.listByPrefix(prefix),
  ]);
  return toDomainList(challengeDtos, translations);
}

export async function filter(params = {}) {
  const challengeDtos = await _getChallengesFromParams(params);
  const translations = await loadTranslationsForChallenges(challengeDtos);
  return toDomainList(challengeDtos, translations);
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

async function loadTranslationsForChallenges(challengeDtos) {
  return knex.transaction(async (transaction) => {
    const challengesTranslations = await Promise.all(challengeDtos.map(
      (challengeDto) => translationRepository.listByPrefix(prefixFor(challengeDto), { transaction })
    ));
    return challengesTranslations.flat();
  }, { readOnly: true });
}

function toDomainList(challengeDtos, translations) {
  const translationsByLocaleAndChallengeId = _.groupBy(translations, ({
    locale,
    key
  }) => `${locale}:${key.split('.')[1]}`);

  return challengeDtos.map((challengeDto) => {
    const challengeLocale = getPrimaryLocaleFromChallenge(challengeDto.locales) ?? 'fr';
    const filteredTranslations = translationsByLocaleAndChallengeId[`${challengeLocale}:${challengeDto.id}`] ?? [];
    return toDomain(challengeDto, filteredTranslations);
  });
}

function toDomain(challengeDto, translations) {
  const translatedFields = Object.fromEntries(
    translations.map(({ key, value }) => [key.split('.').at(-1), value]),
  );
  const challengeLocale = getPrimaryLocaleFromChallenge(challengeDto.locales) ?? 'fr';
  return new Challenge({
    ...challengeDto,
    ...translatedFields,
    translations: {
      [challengeLocale]: translatedFields
    }
  });
}
