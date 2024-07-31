import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { Challenge, Translation } from '../../domain/models/index.js';
import { challengeDatasource, skillDatasource } from '../datasources/airtable/index.js';
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
  if (params?.filter?.formula) {
    return challengeDatasource.filter(params);
  }
  return challengeDatasource.list(params);
}

export async function get(id) {
  const challengeDto = await challengeDatasource.filterById(id);

  if (!challengeDto) throw new NotFoundError('Épreuve introuvable');

  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: [challengeDto.id] });

  const translations = await translationRepository.listByPrefix(`challenge.${id}.`);

  return toDomain(challengeDto, translations, localizedChallenges);
}

export async function list() {
  const [challengeDtos, translations, localizedChallenges] = await Promise.all([
    challengeDatasource.list(),
    translationRepository.listByPrefix(prefix),
    localizedChallengeRepository.list(),
  ]);
  return toDomainList(challengeDtos, translations, localizedChallenges);
}

export async function getMany(ids) {
  const challengeDTOs = await challengeDatasource.filter({ filter: { ids } });
  if (!challengeDTOs) return [];
  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(challengeDTOs);
  return toDomainList(challengeDTOs, translations, localizedChallenges);
}

export async function filter(params = {}) {
  const challengeDtos = await _getChallengesFromParams(params);
  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(challengeDtos);
  return toDomainList(challengeDtos, translations, localizedChallenges);
}

export async function filterByThematicIds(thematicIds) {
  const formula = `OR(${thematicIds.map((thematicId) => `FIND("${thematicId}", {Thematique (Record ID)})`).join(', ')})`;

  return filter({ filter: { formula } });
}

export async function create(challenge) {
  const createdChallengeDto = await challengeDatasource.create(challenge);
  const primaryLocalizedChallenge = challenge.localizedChallenges[0];
  await localizedChallengeRepository.create({ localizedChallenges: [primaryLocalizedChallenge] });

  const translations = extractTranslationsFromChallenge(challenge);
  await translationRepository.save({ translations });
  return toDomain(createdChallengeDto, translations, [primaryLocalizedChallenge]);
}

export async function createBatch(challenges) {
  if (!challenges || challenges.length === 0) return [];
  const necessarySkillIds = _.uniq(challenges.map((challenge) => challenge.skillId));
  const airtableSkillIdsByIds = await skillDatasource.getAirtableIdsByIds(necessarySkillIds);
  for (const challenge of challenges) {
    challenge.skills = [airtableSkillIdsByIds[challenge.skillId]];
    challenge.files = [];
  }
  const createdChallengesDtos = await challengeDatasource.createBatch(challenges);
  const allLocalizedChallenges = challenges.flatMap((challenge) => challenge.localizedChallenges);
  const allTranslations = challenges.flatMap((challenge) => {
    const translationModels = [];
    for (const [locale, translationsForLocale] of Object.entries(challenge.translations)) {
      for (const [field, value] of Object.entries(translationsForLocale)) {
        translationModels.push(new Translation({
          key: `${prefixFor(challenge)}${field}`,
          locale,
          value,
        }));
      }
    }
    return translationModels;
  });
  return knex.transaction(async (transaction) => {
    await localizedChallengeRepository.create({ localizedChallenges: allLocalizedChallenges, transaction });
    await translationRepository.save({ translations: allTranslations, transaction });
    return toDomainList(createdChallengesDtos, allTranslations, allLocalizedChallenges);
  });
}

export async function update(challenge, knexConn = knex) {
  const updatedChallengeDto = await challengeDatasource.update(challenge);

  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({ challengeIds: [challenge.id], transaction: knexConn });
  const primaryLocalizedChallenge = localizedChallenges.find(({ isPrimary }) => isPrimary);

  const oldPrimaryLocale = primaryLocalizedChallenge.locale;
  if (oldPrimaryLocale !== challenge.primaryLocale) {
    primaryLocalizedChallenge.locale = challenge.primaryLocale;
  }

  primaryLocalizedChallenge.embedUrl = challenge.embedUrl;
  primaryLocalizedChallenge.geography = challenge.geographyCode;
  primaryLocalizedChallenge.urlsToConsult = challenge.urlsToConsult;

  await localizedChallengeRepository.update({
    localizedChallenge: primaryLocalizedChallenge,
    transaction: knexConn,
  });

  const translations = extractTranslationsFromChallenge(challenge);
  await translationRepository.deleteByKeyPrefixAndLocales({
    prefix: prefixFor(challenge),
    locales: [oldPrimaryLocale],
    transaction: knexConn,
  });
  await translationRepository.save({ translations, transaction: knexConn });

  return toDomain(updatedChallengeDto, translations, localizedChallenges);
}

export async function updateBatch(challenges) {
  return knex.transaction(async (transaction) => {
    const updatedChallenges = [];
    for (const challenge of challenges) {
      const updatedChallenge = await update(challenge, transaction);
      updatedChallenges.push(updatedChallenge);
    }
    return updatedChallenges;
  });
}

export async function listBySkillId(skillId) {
  const challengeDTOs = await challengeDatasource.filterBySkillId(skillId);
  if (!challengeDTOs) return [];
  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(challengeDTOs);
  return toDomainList(challengeDTOs, translations, localizedChallenges);
}

async function loadTranslationsAndLocalizedChallengesForChallenges(challengeDtos) {
  if (challengeDtos.length === 0) return [[], []];

  return knex.transaction(async (transaction) => {
    const challengesTranslations = await Promise.all(challengeDtos.map(
      (challengeDto) => translationRepository.listByPrefix(prefixFor(challengeDto), { transaction })
    ));
    const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({
      challengeIds: challengeDtos.map(({ id }) => id),
      transaction,
    });

    return [challengesTranslations.flat(), localizedChallenges];
  }, { readOnly: true });
}

function toDomainList(challengeDtos, translations, localizedChallenges) {
  const translationsByChallengeId = _.groupBy(translations, 'entityId');
  const localizedChallengesByChallengeId = _.groupBy(localizedChallenges, 'challengeId');

  return challengeDtos.map((challengeDto) => {
    const challengeTranslations = translationsByChallengeId[challengeDto.id] ?? [];
    const localizedChallenges = localizedChallengesByChallengeId[challengeDto.id] ?? [];

    return toDomain(challengeDto, challengeTranslations, localizedChallenges);
  });
}

function toDomain(challengeDto, challengeTranslations, localizedChallenges = []) {
  const translationsByLocale = _.groupBy(challengeTranslations, 'locale');
  const translations = _.mapValues(translationsByLocale, (localeTranslations) => {
    return Object.fromEntries([
      ...localeTranslations.map(({ key, value }) => [key.split('.').at(-1), value]),
    ]);
  });
  return new Challenge({
    ...challengeDto,
    translations,
    localizedChallenges,
  });
}
