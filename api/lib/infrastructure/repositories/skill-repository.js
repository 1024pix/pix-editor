import * as translationRepository from './translation-repository.js';
import * as skillTranslations from '../translations/skill.js';
import { Skill } from '../../domain/models/Skill.js';
import { knex } from '../../../db/knex-database-connection.js';
import { escapeLikeWildcards } from './sql-utils.js';

const TABLE_NAME = 'skills';
const TUTORIALS_RELATION_TABLE_NAME = 'skills-tutorials';
const TUTORIAL_RELATION_TYPES = {
  UNDERSTANDING: 'understanding',
  LEARNING_MORE: 'learningMore',
};
const model = 'skill';

export async function list() {
  const [dtos, translations] = await Promise.all([selectSkills().orderBy('id'), translationRepository.listByModel(model)]);

  return toDomainList(dtos, translations);
}

export async function get(id) {
  const [dto, translations] = await Promise.all([selectSkills().where('skills.id', id).first(), translationRepository.listByEntity(model, id)]);

  if (!dto) return null;
  return toDomain(dto, translations);
}

export async function getMany(ids) {
  if (!ids?.length) return [];

  const [pgDtos, translations] = await Promise.all([selectSkills().whereIn('skills.id', ids).orderBy('skills.id'), translationRepository.listByEntities(model, ids)]);

  return toDomainList(pgDtos, translations);
}

/**
 * @deprecated use {@link get}
 */
export async function getByAirtableId(id) {
  return get(id);
}

/**
 * @deprecated use {@link getMany}
 */
export async function getManyByAirtableIds(ids) {
  return getMany(ids);
}

export async function listByTubeId(tubeId) {
  const dtos = await selectSkills().where('skills.tubeId', tubeId).orderBy('skills.id');

  if (dtos.length === 0) return [];

  const translations = await translationRepository.listByEntities(
    model,
    dtos.map(({ id }) => id),
  );

  return toDomainList(dtos, translations);
}

export async function listActiveByCompetenceId(competenceId) {
  const dtos = await selectSkills()
    .where('thematics.competenceId', competenceId)
    .where('skills.status', Skill.STATUSES.ACTIF)
    .orderBy('skills.id');

  if (dtos.length === 0) return [];

  const translations = await translationRepository.listByEntities(
    model,
    dtos.map(({ id }) => id),
  );

  return toDomainList(dtos, translations);
}

export async function listByCompetenceId(competenceId) {
  const dtos = await selectSkills().where('thematics.competenceId', competenceId).orderBy('skills.id');

  if (dtos.length === 0) return [];

  const translations = await translationRepository.listByEntities(
    model,
    dtos.map(({ id }) => id),
  );

  return toDomainList(dtos, translations);
}

export async function search(params) {
  let query = selectSkills().whereRaw("?? || coalesce(??::varchar, '') ilike ?", [
    'tubes.name',
    'skills.level',
    `${escapeLikeWildcards(params.filter.name)}%`,
  ]).where('tubes.name', '<>', '@workbench');
  if (params.sort) {
    const orderBySqlAndParams = params.sort.map(([field, direction]) => {
      if (field === 'name') {
        return [
          `(?? || ??) collate ?? ${direction}`,
          [
            'tubes.name',
            'skills.level',
            'fr-x-icu',
          ],
        ];
      }
      return [`?? ${direction}`, [`skills.${field}`]];
    });
    const orderBySql = orderBySqlAndParams.map(([sql]) => sql).join(', ');
    const orderByParams = orderBySqlAndParams.flatMap(([, params]) => params);
    query = query.orderByRaw(orderBySql, orderByParams);
  } else {
    query = query.orderBy('skills.id');
  }
  if (params.page?.limit) {
    query = query.limit(params.page?.limit);
  }

  const dtos = await query;

  if (dtos.length === 0) return [];

  const translations = await translationRepository.listByEntities(
    model,
    dtos.map(({ id }) => id),
  );

  return toDomainList(dtos, translations);
}

export function selectSkills(knexConn = knex) {
  return knexConn
    .select(
      'skills.*',
      knexConn.raw("?? || coalesce(??::varchar, '') as ??", [
        'tubes.name',
        'skills.level',
        'name',
      ]),
      'thematics.competenceId',
      knexConn.raw(
        'coalesce((??), \'[]\') as "tutorialIds"',
        knexConn
          .select(
            knexConn.raw('json_agg(?? order by ??)', ['skills-tutorials.tutorialId', 'skills-tutorials.tutorialId']),
          )
          .from('skills-tutorials')
          .where('skills-tutorials.skillId', knexConn.ref('skills.id'))
          .where('skills-tutorials.type', TUTORIAL_RELATION_TYPES.UNDERSTANDING),
      ),
      knexConn.raw(
        'coalesce((??), \'[]\') as "learningMoreTutorialIds"',
        knexConn
          .select(
            knexConn.raw('json_agg(?? order by ??)', ['skills-tutorials.tutorialId', 'skills-tutorials.tutorialId']),
          )
          .from('skills-tutorials')
          .where('skills-tutorials.skillId', knexConn.ref('skills.id'))
          .where('skills-tutorials.type', TUTORIAL_RELATION_TYPES.LEARNING_MORE),
      ),
      knexConn.raw(
        'coalesce((??), \'[]\') as "challengeIds"',
        knexConn
          .select(knexConn.raw('json_agg(?? order by ??)', ['challenges.id', 'challenges.id']))
          .from('challenges')
          .where('challenges.skillId', knexConn.ref('skills.id')),
      ),
    )
    .from('skills')
    .leftOuterJoin('tubes', 'tubes.id', 'skills.tubeId')
    .leftOuterJoin('thematics', 'thematics.id', 'tubes.thematicId');
}

export async function create(skill) {
  return knex.transaction(async (transaction) => {
    await transaction
      .insert({
        id: skill.id,
        status: skill.status,
        hintStatus: skill.hintStatus,
        descriptionStatus: skill.descriptionStatus,
        description: skill.description,
        level: skill.level,
        internationalisation: skill.internationalisation,
        version: skill.version,
        tubeId: skill.tubeAirtableId,
      })
      .into(TABLE_NAME);

    const translations = skillTranslations.extractFromDomainObject(skill);
    await translationRepository.save({ translations, transaction });

    const skillTutorials = [
      ...(skill.tutorialAirtableIds?.map((tutorialId) => ({
        skillId: skill.id,
        tutorialId,
        type: TUTORIAL_RELATION_TYPES.UNDERSTANDING,
      })) ?? []),
      ...(skill.learningMoreTutorialAirtableIds?.map((tutorialId) => ({
        skillId: skill.id,
        tutorialId,
        type: TUTORIAL_RELATION_TYPES.LEARNING_MORE,
      })) ?? []),
    ];
    if (skillTutorials.length > 0) {
      await transaction.insert(skillTutorials).into(TUTORIALS_RELATION_TABLE_NAME);
    }

    const dto = await selectSkills(transaction).where('skills.id', skill.id).first();

    return toDomain(dto, translations);
  });
}

export async function update(skill) {
  return knex.transaction(async (transaction) => {
    await transaction(TABLE_NAME)
      .update({
        status: skill.status,
        hintStatus: skill.hintStatus,
        descriptionStatus: skill.descriptionStatus,
        description: skill.description,
        level: skill.level,
        internationalisation: skill.internationalisation,
        version: skill.version,
        activatedAt: skill.activatedAt,
        archivedAt: skill.archivedAt,
        obsoletedAt: skill.obsoletedAt,
        updatedAt: transaction.fn.now(),
      })
      .where('id', skill.id);

    const translations = skillTranslations.extractFromDomainObject(skill);
    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${skillTranslations.prefix}${skill.id}.`,
      locales: ['fr', 'en'],
      transaction,
    });
    await translationRepository.save({ translations, transaction });

    const skillTutorials = [
      ...skill.tutorialAirtableIds.map((tutorialId) => ({
        skillId: skill.id,
        tutorialId,
        type: TUTORIAL_RELATION_TYPES.UNDERSTANDING,
      })),
      ...skill.learningMoreTutorialAirtableIds.map((tutorialId) => ({
        skillId: skill.id,
        tutorialId,
        type: TUTORIAL_RELATION_TYPES.LEARNING_MORE,
      })),
    ];
    await transaction
      .delete()
      .from(TUTORIALS_RELATION_TABLE_NAME)
      .where('skillId', skill.id)
      .whereNotIn(
        ['tutorialId', 'type'],
        skillTutorials.map(({ tutorialId, type }) => [tutorialId, type]),
      );
    if (skillTutorials.length > 0) {
      await transaction
        .insert(skillTutorials)
        .into(TUTORIALS_RELATION_TABLE_NAME)
        .onConflict([
          'skillId',
          'tutorialId',
          'type',
        ])
        .merge({ updatedAt: transaction.fn.now() });
    }

    const dto = await selectSkills(transaction).where('skills.id', skill.id).first();

    return toDomain(dto, translations);
  });
}

function toDomainList(dtos, translations) {
  const translationsBySkillId = Object.groupBy(translations, (translation) => translation.entityId);
  return dtos.map((dto) => toDomain(dto, translationsBySkillId[dto.id]));
}

function toDomain(
  { id, tubeId, tutorialIds = [], learningMoreTutorialIds = [], challengeIds = [], ...dto },
  translations = [],
) {
  return new Skill({
    id,
    airtableId: id,
    tubeId,
    tubeAirtableId: tubeId,
    tutorialIds,
    tutorialAirtableIds: tutorialIds,
    learningMoreTutorialIds,
    learningMoreTutorialAirtableIds: learningMoreTutorialIds,
    challengeIds,
    ...dto,
    ...skillTranslations.toDomain(translations),
  });
}
