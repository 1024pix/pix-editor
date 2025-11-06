import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { Challenge, Skill, Translation } from '../../domain/models/index.js';
import * as translationRepository from './translation-repository.js';
import * as localizedChallengeRepository from './localized-challenge-repository.js';
import { extractFromChallenge as extractTranslationsFromChallenge, prefixFor } from '../translations/challenge.js';
import { NotFoundError } from '../../domain/errors.js';
import { escapeLikeWildcards } from './sql-utils.js';

const model = 'challenge';

export async function get(id) {
  const [
    dto,
    localizedChallenges,
    translations,
  ] = await Promise.all([
    selectChallenges().where('challenges.id', id).first(),
    localizedChallengeRepository.listByChallengeIds({ challengeIds: [id] }),
    translationRepository.listByEntity(model, id),
  ]);

  if (!dto) throw new NotFoundError('Épreuve introuvable');

  return toDomain(dto, translations, localizedChallenges);
}

export async function list() {
  const [
    dtos,
    translations,
    localizedChallenges,
  ] = await Promise.all([
    selectChallenges().orderBy('challenges.id'),
    translationRepository.listByModel(model),
    localizedChallengeRepository.list(),
  ]);

  return toDomainList(dtos, translations, localizedChallenges);
}

export async function getMany(ids) {
  const [dtos, [translations, localizedChallenges]] = await Promise.all([selectChallenges().whereIn('challenges.id', ids).orderBy('challenges.id'), loadTranslationsAndLocalizedChallengesForChallengeIds(ids)]);

  if (dtos.length === 0) return [];

  return toDomainList(dtos, translations, localizedChallenges);
}

export async function filter(params = {}) {
  const ids = await translationRepository.search({
    entity: model,
    fields: ['instruction', 'proposals'],
    search: params.filter.search,
    limit: params.page?.size,
  });
  const dtos = await selectChallenges()
    .whereIn('challenges.id', ids)
    .orWhereIn(
      'challenges.id',
      knex
        .select('challengeId')
        .from('localized_challenges')
        .whereILike('embedUrl', `%${escapeLikeWildcards(params.filter.search)}%`),
    )
    .limit(params.page?.size)
    .orderBy('challenges.id');

  if (dtos.length === 0) return [];

  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(dtos);

  return toDomainList(dtos, translations, localizedChallenges);
}

export async function create(challenge) {
  return knex.transaction(async (transaction) => {
    await transaction
      .insert({
        id: challenge.id,
        type: challenge.type,
        t1Status: challenge.t1Status,
        t2Status: challenge.t2Status,
        t3Status: challenge.t3Status,
        status: challenge.status,
        skillId: challenge.skills[0],
        embedHeight: challenge.embedHeight,
        timer: challenge.timer,
        format: challenge.format,
        autoReply: challenge.autoReply,
        locales: challenge.locales,
        focusable: challenge.focusable,
        genealogy: challenge.genealogy,
        pedagogy: challenge.pedagogy,
        author: challenge.author,
        declinable: challenge.declinable,
        version: challenge.version,
        alternativeVersion: challenge.alternativeVersion,
        accessibility1: challenge.accessibility1,
        accessibility2: challenge.accessibility2,
        spoil: challenge.spoil,
        responsive: challenge.responsive,
        shuffled: challenge.shuffled,
        contextualizedFields: challenge.contextualizedFields,
      })
      .into('challenges');

    const primaryLocalizedChallenge = challenge.localizedChallenges[0];
    await localizedChallengeRepository.create({ localizedChallenges: [primaryLocalizedChallenge], transaction });

    const translations = extractTranslationsFromChallenge(challenge);
    await translationRepository.save({ translations, transaction });

    const dto = await selectChallenges(transaction).where('challenges.id', challenge.id).first();

    return toDomain(dto, translations, [primaryLocalizedChallenge]);
  });
}

export async function createBatch(challenges) {
  return knex.transaction(async (transaction) => {
    if (!challenges || challenges.length === 0) return [];

    const allLocalizedChallenges = challenges.flatMap((challenge) => challenge.localizedChallenges);
    const allTranslations = challenges.flatMap((challenge) => {
      const translationModels = [];
      for (const [locale, translationsForLocale] of Object.entries(challenge.translations)) {
        for (const [field, value] of Object.entries(translationsForLocale)) {
          translationModels.push(
            new Translation({
              key: `${prefixFor(challenge)}${field}`,
              locale,
              value,
            }),
          );
        }
      }
      return translationModels;
    });

    await transaction
      .insert(
        challenges.map((challenge) => ({
          id: challenge.id,
          type: challenge.type,
          t1Status: challenge.t1Status,
          t2Status: challenge.t2Status,
          t3Status: challenge.t3Status,
          status: challenge.status,
          skillId: challenge.skillId,
          embedHeight: challenge.embedHeight,
          timer: challenge.timer,
          format: challenge.format,
          autoReply: challenge.autoReply,
          locales: challenge.locales,
          focusable: challenge.focusable,
          genealogy: challenge.genealogy,
          pedagogy: challenge.pedagogy,
          author: challenge.author,
          declinable: challenge.declinable,
          version: challenge.version,
          alternativeVersion: challenge.alternativeVersion,
          accessibility1: challenge.accessibility1,
          accessibility2: challenge.accessibility2,
          spoil: challenge.spoil,
          responsive: challenge.responsive,
          shuffled: challenge.shuffled,
          contextualizedFields: challenge.contextualizedFields,
        })),
      )
      .into('challenges');

    await localizedChallengeRepository.create({ localizedChallenges: allLocalizedChallenges, transaction });
    await translationRepository.save({ translations: allTranslations, transaction });

    const dtos = await selectChallenges(transaction)
      .whereIn(
        'challenges.id',
        challenges.map(({ id }) => id),
      )
      .orderBy('challenges.id');

    return toDomainList(dtos, allTranslations, allLocalizedChallenges);
  });
}

// TODO : faire une méthode update au niveau du modèle challenge, comme ça ça update le primary localized challenge en cascade
// là c'est un peu moche mais on utilise le update de LocalizedChallenge avec un "faux" localizedChallenge de support
export async function update(challenge, transaction = knex) {
  await transaction('challenges')
    .update({
      type: challenge.type,
      t1Status: challenge.t1Status,
      t2Status: challenge.t2Status,
      t3Status: challenge.t3Status,
      status: challenge.status,
      skillId: updatedChallengeDto.skillId,
      embedHeight: challenge.embedHeight,
      timer: challenge.timer,
      format: challenge.format,
      autoReply: challenge.autoReply,
      locales: challenge.locales,
      focusable: challenge.focusable,
      genealogy: challenge.genealogy,
      pedagogy: challenge.pedagogy,
      author: challenge.author,
      declinable: challenge.declinable,
      version: challenge.version,
      alternativeVersion: challenge.alternativeVersion,
      accessibility1: challenge.accessibility1,
      accessibility2: challenge.accessibility2,
      spoil: challenge.spoil,
      responsive: challenge.responsive,
      shuffled: challenge.shuffled,
      contextualizedFields: challenge.contextualizedFields,
      archivedAt: challenge.archivedAt,
      madeObsoleteAt: challenge.madeObsoleteAt,
      validatedAt: challenge.validatedAt,
      updatedAt: transaction.fn.now(),
    })
    .where('id', challenge.id);

  const localizedChallenges = await localizedChallengeRepository.listByChallengeIds({
    challengeIds: [challenge.id],
    transaction,
  });
  const primaryLocalizedChallenge = localizedChallenges.find(({ isPrimary }) => isPrimary);

  const oldPrimaryLocale = primaryLocalizedChallenge.locale;
  const updateLocalizedChallengePOJO = {
    locale: oldPrimaryLocale !== challenge.primaryLocale ? challenge.primaryLocale : oldPrimaryLocale,
    embedUrl: challenge.embedUrl,
    geography: challenge.geography,
    urlsToConsult: challenge.urlsToConsult,
    requireGafamWebsiteAccess: challenge.requireGafamWebsiteAccess,
    isIncompatibleIpadCertif: challenge.isIncompatibleIpadCertif,
    deafAndHardOfHearing: challenge.deafAndHardOfHearing,
    isAwarenessChallenge: challenge.isAwarenessChallenge,
    toRephrase: challenge.toRephrase,
    hasEmbedInternalValidation: challenge.hasEmbedInternalValidation,
    noValidationNeeded: challenge.noValidationNeeded,
  };
  primaryLocalizedChallenge.update(updateLocalizedChallengePOJO);

  await localizedChallengeRepository.update({
    localizedChallenge: primaryLocalizedChallenge,
    transaction,
  });

  const translations = extractTranslationsFromChallenge(challenge);
  await translationRepository.deleteByKeyPrefixAndLocales({
    prefix: prefixFor(challenge),
    locales: [oldPrimaryLocale],
    transaction,
  });
  await translationRepository.save({ translations, transaction });

  const dto = await selectChallenges(transaction).where('challenges.id', challenge.id).first();

  return toDomain(dto, translations, localizedChallenges);
}

export async function listBySkillId(skillId) {
  const dtos = await selectChallenges().where('challenges.skillId', skillId).orderBy('id');

  if (dtos.length === 0) return [];

  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(dtos);

  return toDomainList(dtos, translations, localizedChallenges);
}

export async function listActiveOrDraftByCompetenceId(competenceId) {
  const dtos = await selectChallenges()
    .where('thematics.competenceId', competenceId)
    .andWhereNot('tubes.name', Skill.WORKBENCH_NAME)
    .and.whereIn('challenges.status', [Challenge.STATUSES.PROPOSE, Challenge.STATUSES.VALIDE])
    .orderBy('id');

  if (dtos.length === 0) return [];

  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(dtos);

  return toDomainList(dtos, translations, localizedChallenges);
}

export async function listPrototypesByCompetenceId(competenceId) {
  const dtos = await selectChallenges()
    .where('thematics.competenceId', competenceId)
    .andWhereNot('tubes.name', Skill.WORKBENCH_NAME)
    .andWhere('genealogy', Challenge.GENEALOGIES.PROTOTYPE)
    .orderBy('id');

  if (dtos.length === 0) return [];

  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(dtos);

  return toDomainList(dtos, translations, localizedChallenges);
}

export async function listValidPrototypesBySkillIds(skillIds) {
  const dtos = await selectChallenges()
    .whereIn('skills.id', skillIds)
    .andWhere('genealogy', Challenge.GENEALOGIES.PROTOTYPE)
    .andWhere('challenges.status', Challenge.STATUSES.VALIDE)
    .orderBy('challenges.id');

  if (dtos.length === 0) return [];

  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(dtos);

  return toDomainList(dtos, translations, localizedChallenges);
}

async function loadTranslationsAndLocalizedChallengesForChallenges(challengeDtos) {
  return loadTranslationsAndLocalizedChallengesForChallengeIds(challengeDtos.map(({ id }) => id));
}

async function loadTranslationsAndLocalizedChallengesForChallengeIds(challengeIds) {
  if (challengeIds.length === 0) return [[], []];

  return Promise.all([translationRepository.listByEntities(model, challengeIds), localizedChallengeRepository.listByChallengeIds({ challengeIds })]);
}

function selectChallenges(knexConn = knex) {
  return knexConn
    .select(
      'challenges.*',
      'thematics.competenceId',
      knexConn.raw(
        'coalesce((??), \'[]\') as "files"',
        knexConn
          .select(
            knexConn.raw("json_agg(json_build_object('fileId', ??, 'localizedChallengeId', ??) order by ??)", [
              'attachments.id',
              'attachments.localizedChallengeId',
              'attachments.id',
            ]),
          )
          .from('attachments')
          .where('attachments.challengeId', knexConn.ref('challenges.id')),
      ),
    )
    .from('challenges')
    .leftOuterJoin('skills', 'skills.id', 'challenges.skillId')
    .leftOuterJoin('tubes', 'tubes.id', 'skills.tubeId')
    .leftOuterJoin('thematics', 'thematics.id', 'tubes.thematicId');
}

function toDomainList(dtos, translations, localizedChallenges) {
  const translationsByChallengeId = Object.groupBy(translations, (translation) => translation.entityId);
  const localizedChallengesByChallengeId = Object.groupBy(
    localizedChallenges,
    (localizedChallenge) => localizedChallenge.challengeId,
  );

  return dtos.map((dto) => {
    const challengeTranslations = translationsByChallengeId[dto.id] ?? [];
    const localizedChallenges = localizedChallengesByChallengeId[dto.id] ?? [];

    return toDomain(dto, challengeTranslations, localizedChallenges);
  });
}

function toDomain({ id, skillId, ...dto }, challengeTranslations, localizedChallenges = []) {
  const translationsByLocale = Object.groupBy(challengeTranslations, (translation) => translation.locale);
  const translations = _.mapValues(translationsByLocale, (localeTranslations) => {
    return Object.fromEntries([...localeTranslations.map(({ key, value }) => [key.split('.').at(-1), value])]);
  });

  return new Challenge({
    id,
    airtableId: id,
    skillId,
    skills: [skillId],
    ...dto,
    translations,
    localizedChallenges,
  });
}
