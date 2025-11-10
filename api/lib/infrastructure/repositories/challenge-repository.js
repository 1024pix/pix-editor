import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { Challenge, Skill, Translation } from '../../domain/models/index.js';
import { challengeDatasource, skillDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as localizedChallengeRepository from './localized-challenge-repository.js';
import { extractFromChallenge as extractTranslationsFromChallenge, prefixFor } from '../translations/challenge.js';
import { NotFoundError } from '../../domain/errors.js';
import { stringValue } from '../airtable.js';
import {
  areArrayEquals,
  areNullableDatesEqual,
  areNullableValuesEqual,
  compareDtos,
  compareDtosLists,
} from './migration-from-airtable.js';
import { escapeLikeWildcards } from './sql-utils.js';

const model = 'challenge';

export async function get(id) {
  const [airtableDto, pgDto, localizedChallenges, translations] = await Promise.all([
    challengeDatasource.filterById(id),
    selectChallenges().where('challenges.id', id).first(),
    localizedChallengeRepository.listByChallengeIds({ challengeIds: [id] }),
    translationRepository.listByEntity(model, id),
  ]);

  compareDtos(airtableDto, pgDto, compareChallengeDtos);

  if (!airtableDto) throw new NotFoundError('Épreuve introuvable');

  return toDomain(airtableDto, translations, localizedChallenges);
}

export async function list() {
  const [airtableDtos, pgDtos, translations, localizedChallenges] = await Promise.all([
    challengeDatasource.list(),
    selectChallenges().orderBy('challenges.id'),
    translationRepository.listByModel(model),
    localizedChallengeRepository.list(),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareChallengeDtos);

  return toDomainList(airtableDtos, translations, localizedChallenges);
}

export async function getMany(ids) {
  const [airtableDtos, pgDtos, [translations, localizedChallenges]] = await Promise.all([
    challengeDatasource.filter({ filter: { ids } }),
    selectChallenges().whereIn('challenges.id', ids).orderBy('challenges.id'),
    loadTranslationsAndLocalizedChallengesForChallengeIds(ids),
  ]);
  compareDtosLists(airtableDtos ?? [], pgDtos, compareChallengeDtos);

  if (!airtableDtos) return [];
  return toDomainList(airtableDtos, translations, localizedChallenges);
}

export async function filter(params = {}) {
  let ids = await translationRepository.search({
    entity: model,
    fields: ['instruction', 'proposals'],
    search: params.filter.search,
    limit: params.page?.size,
  });

  ids = await knex
    .pluck('challenges.id')
    .from('challenges')
    .whereIn('challenges.id', ids)
    .orWhereIn(
      'challenges.id',
      knex
        .select('challengeId')
        .from('localized_challenges')
        .whereILike('embedUrl', `%${escapeLikeWildcards(params.filter.search)}%`),
    )
    .limit(params.page?.size)
    .orderBy('challenges.updatedAt', 'desc');

  if (ids.length === 0) return [];

  return getMany(ids);
}

export async function create(challenge) {
  return knex.transaction(async (transaction) => {
    const createdChallengeDto = await challengeDatasource.create(challenge);

    await transaction
      .insert({
        id: challenge.id,
        type: challenge.type,
        t1Status: challenge.t1Status,
        t2Status: challenge.t2Status,
        t3Status: challenge.t3Status,
        status: challenge.status,
        skillId: createdChallengeDto.skillId,
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
    return toDomain(createdChallengeDto, translations, [primaryLocalizedChallenge]);
  });
}

export async function createBatch(challenges) {
  return knex.transaction(async (transaction) => {
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

    await Promise.all(
      challenges.map((challenge) =>
        transaction
          .insert({
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
          })
          .into('challenges'),
      ),
    );
    await localizedChallengeRepository.create({ localizedChallenges: allLocalizedChallenges, transaction });
    await translationRepository.save({ translations: allTranslations, transaction });
    return toDomainList(createdChallengesDtos, allTranslations, allLocalizedChallenges);
  });
}
// TODO : faire une méthode update au niveau du modèle challenge, comme ça ça update le primary localized challenge en cascade
// là c'est un peu moche mais on utilise le update de LocalizedChallenge avec un "faux" localizedChallenge de support
export async function update(challenge, transaction = knex) {
  const updatedChallengeDto = await challengeDatasource.update(challenge);

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
  return toDomain(updatedChallengeDto, translations, localizedChallenges);
}

export async function listBySkillId(skillId) {
  const [airtableDtos, pgDtos] = await Promise.all([
    challengeDatasource.filterBySkillId(skillId),
    selectChallenges().where('challenges.skillId', skillId).orderBy('id'),
  ]);
  compareDtosLists(airtableDtos ?? [], pgDtos, compareChallengeDtos);

  if (!airtableDtos) return [];
  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(airtableDtos);
  return toDomainList(airtableDtos, translations, localizedChallenges);
}

export async function listActiveOrDraftByCompetenceId(competenceId) {
  const [airtableDtos, pgDtos] = await Promise.all([
    challengeDatasource.listActiveOrDraftByCompetenceId(competenceId),
    selectChallenges()
      .where('thematics.competenceId', competenceId)
      .andWhereNot('tubes.name', Skill.WORKBENCH_NAME)
      .and.whereIn('challenges.status', [Challenge.STATUSES.PROPOSE, Challenge.STATUSES.VALIDE])
      .orderBy('id'),
  ]);
  compareDtosLists(airtableDtos ?? [], pgDtos, compareChallengeDtos);

  if (!airtableDtos) return [];
  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(airtableDtos);
  return toDomainList(airtableDtos, translations, localizedChallenges);
}

export async function listPrototypesByCompetenceId(competenceId) {
  const [airtableDtos, pgDtos] = await Promise.all([
    challengeDatasource.listPrototypesByCompetenceId(competenceId),
    selectChallenges()
      .where('thematics.competenceId', competenceId)
      .andWhereNot('tubes.name', Skill.WORKBENCH_NAME)
      .andWhere('genealogy', Challenge.GENEALOGIES.PROTOTYPE)
      .orderBy('id'),
  ]);
  compareDtosLists(airtableDtos ?? [], pgDtos, compareChallengeDtos);

  if (!airtableDtos) return [];
  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(airtableDtos);
  return toDomainList(airtableDtos, translations, localizedChallenges);
}

export async function listValidPrototypesBySkillIds(skillIds) {
  const [airtableDtos, pgDtos] = await Promise.all([
    challengeDatasource.filter({
      filter: {
        formula: `AND(OR(${skillIds.map((skillId) => `{Acquis (id persistant)} = ${stringValue(skillId)}`).join(', ')}), {Généalogie} = ${stringValue(Challenge.GENEALOGIES.PROTOTYPE)}, {Statut} = ${stringValue(Challenge.STATUSES.VALIDE)})`,
      },
    }),
    selectChallenges()
      .whereIn('skills.id', skillIds)
      .andWhere('genealogy', Challenge.GENEALOGIES.PROTOTYPE)
      .andWhere('challenges.status', Challenge.STATUSES.VALIDE)
      .orderBy('challenges.id'),
  ]);
  compareDtosLists(airtableDtos ?? [], pgDtos, compareChallengeDtos);

  if (!airtableDtos) return [];
  const [translations, localizedChallenges] = await loadTranslationsAndLocalizedChallengesForChallenges(airtableDtos);
  return toDomainList(airtableDtos, translations, localizedChallenges);
}

async function loadTranslationsAndLocalizedChallengesForChallenges(challengeDtos) {
  return loadTranslationsAndLocalizedChallengesForChallengeIds(challengeDtos.map(({ id }) => id));
}

async function loadTranslationsAndLocalizedChallengesForChallengeIds(challengeIds) {
  if (challengeIds.length === 0) return [[], []];

  return Promise.all([
    translationRepository.listByEntities(model, challengeIds),
    localizedChallengeRepository.listByChallengeIds({ challengeIds }),
  ]);
}

function selectChallenges() {
  return knex
    .select(
      'challenges.*',
      'thematics.competenceId',
      knex.raw(
        'coalesce((??), \'[]\') as "files"',
        knex
          .select(
            knex.raw("json_agg(json_build_object('fileId', ??, 'localizedChallengeId', ??))", [
              'attachments.id',
              'attachments.localizedChallengeId',
            ]),
          )
          .from('attachments')
          .where('attachments.challengeId', knex.ref('challenges.id')),
      ),
    )
    .from('challenges')
    .leftOuterJoin('skills', 'skills.id', 'challenges.skillId')
    .leftOuterJoin('tubes', 'tubes.id', 'skills.tubeId')
    .leftOuterJoin('thematics', 'thematics.id', 'tubes.thematicId');
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
    return Object.fromEntries([...localeTranslations.map(({ key, value }) => [key.split('.').at(-1), value])]);
  });

  return new Challenge({
    ...challengeDto,
    translations,
    localizedChallenges,
  });
}

function compareChallengeDtos(airtableDto, pgDto) {
  const diff = [];
  if (airtableDto.id !== pgDto.id) diff.push(`challenge airtable id "${airtableDto.id}" != postgres id "${pgDto.id}"`);
  if (!areNullableValuesEqual(airtableDto.type, pgDto.type))
    diff.push(`challenge airtable type "${airtableDto.type}" != postgres type "${pgDto.type}"`);
  if (airtableDto.t1Status !== pgDto.t1Status)
    diff.push(`challenge airtable t1Status "${airtableDto.t1Status}" != postgres t1Status "${pgDto.t1Status}"`);
  if (airtableDto.t2Status !== pgDto.t2Status)
    diff.push(`challenge airtable t2Status "${airtableDto.t2Status}" != postgres t2Status "${pgDto.t2Status}"`);
  if (airtableDto.t3Status !== pgDto.t3Status)
    diff.push(`challenge airtable t3Status "${airtableDto.t3Status}" != postgres t3Status "${pgDto.t3Status}"`);
  if (!areNullableValuesEqual(airtableDto.status, pgDto.status))
    diff.push(`challenge airtable status "${airtableDto.status}" != postgres status "${pgDto.status}"`);
  if (!areNullableValuesEqual(airtableDto.skillId, pgDto.skillId))
    diff.push(`challenge airtable skillId "${airtableDto.skillId}" != postgres skillId "${pgDto.skillId}"`);
  if (!areNullableValuesEqual(airtableDto.embedHeight, pgDto.embedHeight))
    diff.push(
      `challenge airtable embedHeight "${airtableDto.embedHeight}" != postgres embedHeight "${pgDto.embedHeight}"`,
    );
  if (!areNullableValuesEqual(airtableDto.timer, pgDto.timer))
    diff.push(`challenge airtable timer "${airtableDto.timer}" != postgres timer "${pgDto.timer}"`);
  if (!areNullableValuesEqual(airtableDto.competenceId, pgDto.competenceId))
    diff.push(
      `challenge airtable competenceId "${airtableDto.competenceId}" != postgres competenceId "${pgDto.competenceId}"`,
    );
  if (!areNullableValuesEqual(airtableDto.format, pgDto.format))
    diff.push(`challenge airtable format "${airtableDto.format}" != postgres format "${pgDto.format}"`);
  if (airtableDto.autoReply !== pgDto.autoReply)
    diff.push(`challenge airtable autoReply "${airtableDto.autoReply}" != postgres autoReply "${pgDto.autoReply}"`);
  if (!areArrayEquals(airtableDto.locales, pgDto.locales))
    diff.push(`challenges airtable locales "${airtableDto.locales}" != postgres locales "${pgDto.locales}"`);
  if (!areNullableValuesEqual(airtableDto.genealogy, pgDto.genealogy))
    diff.push(`challenge airtable genealogy "${airtableDto.genealogy}" != postgres genealogy "${pgDto.genealogy}"`);
  if (!areNullableValuesEqual(airtableDto.pedagogy, pgDto.pedagogy))
    diff.push(`challenge airtable pedagogy "${airtableDto.pedagogy}" != postgres pedagogy "${pgDto.pedagogy}"`);
  if (!areArrayEquals(airtableDto.author, pgDto.author))
    diff.push(`challenge airtable author "${airtableDto.author}" != postgres author "${pgDto.author}"`);
  if (!areNullableValuesEqual(airtableDto.declinable, pgDto.declinable))
    diff.push(`challenge airtable declinable "${airtableDto.declinable}" != postgres declinable "${pgDto.declinable}"`);
  if (!areNullableValuesEqual(airtableDto.version, pgDto.version))
    diff.push(`challenge airtable version "${airtableDto.version}" != postgres version "${pgDto.version}"`);
  if (!areNullableValuesEqual(airtableDto.alternativeVersion, pgDto.alternativeVersion))
    diff.push(
      `challenge airtable alternativeVersion "${airtableDto.alternativeVersion}" != postgres alternativeVersion "${pgDto.alternativeVersion}"`,
    );
  if (!areNullableValuesEqual(airtableDto.accessibility1, pgDto.accessibility1))
    diff.push(
      `challenge airtable accessibility1 "${airtableDto.accessibility1}" != postgres accessibility1 "${pgDto.accessibility1}"`,
    );
  if (!areNullableValuesEqual(airtableDto.accessibility2, pgDto.accessibility2))
    diff.push(
      `challenge airtable accessibility2 "${airtableDto.accessibility2}" != postgres accessibility2 "${pgDto.accessibility2}"`,
    );
  if (!areNullableValuesEqual(airtableDto.spoil, pgDto.spoil))
    diff.push(`challenge airtable spoil "${airtableDto.spoil}" != postgres spoil "${pgDto.spoil}"`);
  if (!areNullableValuesEqual(airtableDto.responsive, pgDto.responsive))
    diff.push(`challenge airtable responsive "${airtableDto.responsive}" != postgres responsive "${pgDto.responsive}"`);
  if (!areNullableValuesEqual(airtableDto.delta, pgDto.delta))
    diff.push(`challenge airtable delta "${airtableDto.delta}" != postgres delta "${pgDto.delta}"`);
  if (!areNullableValuesEqual(airtableDto.alpha, pgDto.alpha))
    diff.push(`challenge airtable alpha "${airtableDto.alpha}" != postgres alpha "${pgDto.alpha}"`);
  if (airtableDto.shuffled !== pgDto.shuffled)
    diff.push(`challenge airtable shuffled "${airtableDto.shuffled}" != postgres shuffled "${pgDto.shuffled}"`);
  if (!areArrayEquals(airtableDto.contextualizedFields, pgDto.contextualizedFields))
    diff.push(
      `challenge airtable contextualizedFields "${airtableDto.contextualizedFields}" != postgres contextualizedFields "${pgDto.contextualizedFields}"`,
    );
  if (!areNullableDatesEqual(airtableDto.validatedAt, pgDto.validatedAt))
    diff.push(
      `challenge airtable validatedAt "${airtableDto.validatedAt}" != postgres validatedAt "${pgDto.validatedAt}"`,
    );
  if (!areNullableDatesEqual(airtableDto.archivedAt, pgDto.archivedAt))
    diff.push(`challenge airtable archivedAt "${airtableDto.archivedAt}" != postgres archivedAt "${pgDto.archivedAt}"`);
  if (!areNullableDatesEqual(airtableDto.madeObsoleteAt, pgDto.madeObsoleteAt))
    diff.push(
      `challenge airtable madeObsoleteAt "${airtableDto.madeObsoleteAt}" != postgres madeObsoleteAt "${pgDto.madeObsoleteAt}"`,
    );
  if (
    !areArrayEquals(airtableDto.files, pgDto.files, {
      sortFn: (file1, file2) => {
        if (file1.fileId !== file2.fileId) return file1.fileId < file2.fileId ? -1 : 1;
        if (file1.localizedChallengeId === file2.localizedChallengeId) return 0;
        return file1.localizedChallengeId < file2.localizedChallengeId ? -1 : 1;
      },
      compareFn: (file1, file2) =>
        file1.fileId === file2.fileId && file1.localizedChallengeId === file2.localizedChallengeId,
    })
  )
    diff.push(
      `challenge airtable files "${JSON.stringify(airtableDto.files)}" != postgres files "${JSON.stringify(pgDto.files)}"`,
    );

  return diff;
}
