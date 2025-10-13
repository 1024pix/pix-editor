import { knex } from '../../../db/knex-database-connection.js';
import { NotFoundError } from '../../domain/errors.js';
import { LocalizedChallenge } from '../../domain/models/index.js';
import { generateNewId } from '../utils/id-generator.js';
import * as translationRepository from './translation-repository.js';

export async function list() {
  const localizedChallengeDtos = await _queryLocalizedChallengeWithAttachment()
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);
  const translations = await loadTranslationsForLocalizedChallenges(localizedChallengeDtos);
  return toDomainList(localizedChallengeDtos, translations);
}

function _generateId() {
  return generateNewId('challenge');
}

export async function create({ localizedChallenges = [], generateId = _generateId, transaction: knexConnection = knex }) {
  if (localizedChallenges.length === 0) {
    return;
  }
  const dataToInsert = adaptModelsForDB(localizedChallenges, generateId);
  await knexConnection('localized_challenges').insert(dataToInsert).onConflict().ignore();
}

export async function getByChallengeIdAndLocale({ challengeId, locale }) {
  const dto = await _queryLocalizedChallengeWithAttachment()
    .where({
      'localized_challenges.challengeId': challengeId,
      'localized_challenges.locale': locale,
    })
    .first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');
  const translations = await loadTranslationsForLocalizedChallenges([dto]);

  return toDomain(dto, translations);
}

export async function listByChallengeIds({ challengeIds, transaction: knexConnection = knex }) {
  const dtos = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .whereIn('localized_challenges.challengeId', challengeIds)
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);

  const translations = await loadTranslationsForLocalizedChallenges(dtos);
  return toDomainList(dtos, translations);
}

export async function get({ id, transaction: knexConnection = knex }) {
  const dto = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .where('localized_challenges.id', id)
    .first();

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  const translations = await loadTranslationsForLocalizedChallenges([dto]);

  return toDomain(dto, translations);
}

export async function getMany({ ids, transaction: knexConnection = knex }) {
  const dtos = await _queryLocalizedChallengeWithAttachment(knexConnection)
    .whereIn('localized_challenges.id', ids)
    .orderBy(['localized_challenges.challengeId', 'localized_challenges.locale']);

  const translations = await loadTranslationsForLocalizedChallenges(dtos);

  return toDomainList(dtos, translations);
}

export async function update({
  localizedChallenge,
  transaction: knexConnection = knex
}) {
  const localizedChallengeForDB = adaptModelForDB(localizedChallenge);
  delete localizedChallengeForDB.id;
  const [dto] = await knexConnection('localized_challenges')
    .where('id', localizedChallenge.id)
    .update(localizedChallengeForDB).returning('*');

  if (!dto) throw new NotFoundError('Épreuve ou langue introuvable');

  const [primaryEmbedUrl] = await knexConnection('localized_challenges').where({ id: dto.challengeId }).pluck('embedUrl');

  const translations = await loadTranslationsForLocalizedChallenges([dto], knexConnection);

  return toDomain({ ...dto, primaryEmbedUrl, fileIds: localizedChallenge.fileIds }, translations);
}

function toDomainList(dtos, translations) {
  return dtos.map((dto) => toDomain(dto, translations));
}

function toDomain(dto, translations) {
  const localizedChallengeTranslations = translations.filter(
    (translation) => translation.key.startsWith(`challenge.${dto.challengeId}.`) && translation.locale === dto.locale,
  );
  const translatedFields = Object.fromEntries(
    localizedChallengeTranslations.map((translation) => [translation.key.split('.').at(-1), translation.value])
  );
  return new LocalizedChallenge({ ...dto, ...translatedFields });
}

function adaptModelsForDB(localizedChallenges, generateId) {
  return localizedChallenges.map((localizedChallenge) => adaptModelForDB(localizedChallenge, generateId));
}

function adaptModelForDB(localizedChallenge, generateId) {
  return {
    id: localizedChallenge.id ?? generateId(),
    challengeId: localizedChallenge.challengeId,
    embedUrl: localizedChallenge.embedUrl,
    locale: localizedChallenge.locale,
    status: localizedChallenge.status,
    geography: localizedChallenge.geography,
    urlsToConsult: localizedChallenge.urlsToConsult,
    requireGafamWebsiteAccess: localizedChallenge.requireGafamWebsiteAccess,
    isIncompatibleIpadCertif: localizedChallenge.isIncompatibleIpadCertif,
    deafAndHardOfHearing: localizedChallenge.deafAndHardOfHearing,
    isAwarenessChallenge: localizedChallenge.isAwarenessChallenge,
    toRephrase: localizedChallenge.toRephrase,
    hasEmbedInternalValidation: localizedChallenge.hasEmbedInternalValidation,
    noValidationNeeded: localizedChallenge.noValidationNeeded,
    validatedAt: localizedChallenge.validatedAt,
  };
}

function _queryLocalizedChallengeWithAttachment(knexConnection = knex) {
  return knexConnection('localized_challenges')
    .select('localized_challenges.*', 'plc.embedUrl as primaryEmbedUrl', 'fileIds')
    .join({ plc: 'localized_challenges' }, 'plc.id', 'localized_challenges.challengeId')
    .leftJoin(
      knex('localized_challenges-attachments')
        .as('localized_challenges-attachments')
        .groupBy('localizedChallengeId')
        .select('localizedChallengeId', knex.raw('array_agg("attachmentId") as "fileIds"')),
      { 'localized_challenges-attachments.localizedChallengeId': 'localized_challenges.id' });
}

async function loadTranslationsForLocalizedChallenges(localizedChallenges, knexConn) {
  const challengeIds = localizedChallenges.map((localizedChallenge) => localizedChallenge.challengeId);
  const translations = await translationRepository.listByEntities('challenge', challengeIds, { knexConn });
  return translations;
}
