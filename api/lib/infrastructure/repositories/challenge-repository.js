import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { Challenge } from '../../domain/models/index.js';
import { challengeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as localizedChallengeRepository from './localized-challenge-repository.js';
import {
  extractFromChallenge as extractTranslationsFromChallenge,
  prefix,
  prefixFor
} from '../translations/challenge.js';
import { NotFoundError } from '../../domain/errors.js';

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

export async function get(id) {
  const challengeDto = await challengeDatasource.filterById(id);

  if (!challengeDto) throw new NotFoundError('Épreuve introuvable');

  const translations = await translationRepository.listByPrefix(`challenge.${id}.`);

  return toDomain(challengeDto, translations);
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
  await localizedChallengeRepository.create([{
    id: challenge.id,
    challengeId: challenge.id,
    locale: challenge.primaryLocale
  }]);
  return toDomain(createdChallengeDto, translations);
}

export async function update(challenge) {
  const updatedChallengeDto = await challengeDatasource.update(challenge);
  const translations = extractTranslationsFromChallenge(challenge);
  await translationRepository.deleteByKeyPrefixAndLocales(prefixFor(challenge), [challenge.primaryLocale]);
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
  const translationsByChallengeId = _.groupBy(translations, ({ key }) => `${key.split('.')[1]}`);

  return challengeDtos.map((challengeDto) => {
    const challengeTranslations = translationsByChallengeId[challengeDto.id] ?? [];
    return toDomain(challengeDto, challengeTranslations);
  });
}

function toDomain(challengeDto, challengeTranslations) {
  const translationsByLocale = _.groupBy(challengeTranslations, 'locale');
  const translations = _.mapValues(translationsByLocale, (localeTranslations) => {
    return Object.fromEntries([
      ...localeTranslations.map(({ key, value }) => [key.split('.').at(-1), value]),
    ]);
  });
  return new Challenge({
    ...challengeDto,
    translations,
  });
}
