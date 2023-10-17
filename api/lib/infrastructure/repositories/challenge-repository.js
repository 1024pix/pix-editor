import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { Challenge } from '../../domain/models/Challenge.js';
import { challengeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import { extractFromChallenge as extractTranslationsFromChallenge, prefix, prefixFor } from '../translations/challenge.js';

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

export async function create(challenge) {
  const createdChallengeDto = await challengeDatasource.create(challenge);
  const translations = extractTranslationsFromChallenge(challenge);
  await translationRepository.save(translations);
  return toDomain(createdChallengeDto, translations);
}

export async function update(challenge) {
  const updatedChallengeDto = await challengeDatasource.update(challenge);
  const translations = extractTranslationsFromChallenge(challenge);
  await translationRepository.deleteByKeyPrefix(prefixFor(challenge));
  await translationRepository.save(translations);
  return toDomain(updatedChallengeDto, translations);
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
    const challengeLocale = Challenge.getPrimaryLocale(challengeDto.locales) ?? 'fr';
    const filteredTranslations = translationsByLocaleAndChallengeId[`${challengeLocale}:${challengeDto.id}`] ?? [];
    return toDomain(challengeDto, filteredTranslations);
  });
}

function toDomain(challengeDto, translations) {
  const translatedFields = Object.fromEntries([
    ...translations.map(({ key, value }) => [key.split('.').at(-1), value]),
  ]);
  const challengeLocale = Challenge.getPrimaryLocale(challengeDto.locales) ?? 'fr';
  return new Challenge({
    ...challengeDto,
    translations: {
      [challengeLocale]: translatedFields
    }
  });
}
