import _ from 'lodash';

import { skillDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as skillTranslations from '../translations/skill.js';
import { Skill } from '../../domain/models/Skill.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areArrayEquals, areNullableValuesEqual, compareDtosLists, compareDtos } from './migration-from-airtable.js';
import { escapeLikeWildcards } from './sql-utils.js';

const TABLE_NAME = 'skills';
const TUTORIALS_RELATION_TABLE_NAME = 'skills-tutorials';
const TUTORIAL_RELATION_TYPES = {
  UNDERSTANDING: 'understanding',
  LEARNING_MORE: 'learningMore',
};
const model = 'skill';

export async function list() {
  const [
    airtableDtos,
    pgDtos,
    translations,
  ] = await Promise.all([
    skillDatasource.list(),
    selectSkills().orderBy('id'),
    translationRepository.listByModel(model),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareSkillDtos, TABLE_NAME);

  return toDomainList(airtableDtos, translations, pgDtos);
}

export async function get(id) {
  const [
    [airtableDto],
    pgDto,
    translations,
  ] = await Promise.all([
    skillDatasource.filter({ filter: { ids: [id] } }),
    selectSkills().where('skills.id', id).first(),
    translationRepository.listByEntity(model, id),
  ]);

  compareDtos(airtableDto, pgDto, compareSkillDtos, TABLE_NAME);

  if (!airtableDto) return null;
  return toDomain(airtableDto, translations, pgDto);
}

export async function getMany(ids) {
  const [
    airtableDtos,
    pgDtos,
    translations,
  ] = await Promise.all([
    skillDatasource.filter({ filter: { ids } }),
    selectSkills().whereIn('skills.id', ids).orderBy('skills.id'),
    translationRepository.listByEntities(model, ids),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareSkillDtos, TABLE_NAME);

  return toDomainList(airtableDtos, translations, pgDtos);
}

export async function getByAirtableId(id) {
  const airtableDto = await skillDatasource.find(id);
  if (!airtableDto) return null;
  const translations = await translationRepository.listByEntity(model, airtableDto.id);
  const pgDto = await selectSkills().where('skills.id', airtableDto.id).first();

  compareDtos(airtableDto, pgDto, compareSkillDtos, TABLE_NAME);

  return toDomain(airtableDto, translations, pgDto);
}

export async function getManyByAirtableIds(ids) {
  if (!ids?.length) return [];
  const airtableDtos = await skillDatasource.getManyByAirtableIds(ids);
  if (!airtableDtos) return [];
  const translations = await translationRepository.listByEntities(
    model,
    airtableDtos.map(({ id }) => id),
  );
  const pgDtos = await selectSkills()
    .whereIn(
      'skills.id',
      airtableDtos.map(({ id }) => id),
    )
    .orderBy('skills.id');

  compareDtosLists(airtableDtos, pgDtos, compareSkillDtos, TABLE_NAME);

  return toDomainList(airtableDtos, translations, pgDtos);
}

export async function listByTubeId(tubeId) {
  const [airtableDtos, pgDtos] = await Promise.all([skillDatasource.filterByTubeId(tubeId), selectSkills().where('skills.tubeId', tubeId)]);
  compareDtosLists(airtableDtos ?? [], pgDtos, compareSkillDtos, TABLE_NAME);

  if (!airtableDtos) return [];
  const translations = await translationRepository.listByEntities(
    model,
    airtableDtos.map(({ id }) => id),
  );

  return toDomainList(airtableDtos, translations, pgDtos);
}

export async function listActiveByCompetenceId(competenceId) {
  const [airtableDtos, pgDtos] = await Promise.all([
    skillDatasource.listActiveByCompetenceId(competenceId),
    selectSkills()
      .where('thematics.competenceId', competenceId)
      .where('skills.status', Skill.STATUSES.ACTIF)
      .orderBy('skills.id'),
  ]);

  compareDtosLists(airtableDtos ?? [], pgDtos, compareSkillDtos, TABLE_NAME);

  if (!airtableDtos) return [];

  const translations = await translationRepository.listByEntities(
    model,
    airtableDtos.map(({ id }) => id),
  );

  return toDomainList(airtableDtos, translations, pgDtos);
}

export async function listByCompetenceId(competenceId) {
  const [airtableDtos, pgDtos] = await Promise.all([skillDatasource.listByCompetenceId(competenceId), selectSkills().where('thematics.competenceId', competenceId).orderBy('skills.id')]);

  compareDtosLists(airtableDtos ?? [], pgDtos, compareSkillDtos, TABLE_NAME);

  if (!airtableDtos) return [];

  const translations = await translationRepository.listByEntities(
    model,
    airtableDtos.map(({ id }) => id),
  );

  return toDomainList(airtableDtos, translations, pgDtos);
}

export async function search(params) {
  let query = selectSkills().whereRaw("?? || coalesce(??::varchar, '') ilike ?", [
    'tubes.name',
    'skills.level',
    `${escapeLikeWildcards(params.filter.name)}%`,
  ]);
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

  const [airtableDtos, pgDtos] = await Promise.all([skillDatasource.search(params), query]);

  compareDtosLists(airtableDtos ?? [], pgDtos, compareSkillDtos, TABLE_NAME);

  if (!airtableDtos) return [];

  const translations = await translationRepository.listByEntities(
    model,
    airtableDtos.map(({ id }) => id),
  );

  return toDomainList(airtableDtos, translations, pgDtos);
}

export function selectSkills() {
  return knex
    .select(
      'skills.*',
      knex.raw("?? || coalesce(??::varchar, '') as ??", [
        'tubes.name',
        'skills.level',
        'name',
      ]),
      'thematics.competenceId',
      knex.raw(
        'coalesce((??), \'[]\') as "tutorialIds"',
        knex
          .select(knex.raw('json_agg(??)', 'skills-tutorials.tutorialId'))
          .from('skills-tutorials')
          .where('skills-tutorials.skillId', knex.ref('skills.id'))
          .where('skills-tutorials.type', TUTORIAL_RELATION_TYPES.UNDERSTANDING),
      ),
      knex.raw(
        'coalesce((??), \'[]\') as "learningMoreTutorialIds"',
        knex
          .select(knex.raw('json_agg(??)', 'skills-tutorials.tutorialId'))
          .from('skills-tutorials')
          .where('skills-tutorials.skillId', knex.ref('skills.id'))
          .where('skills-tutorials.type', TUTORIAL_RELATION_TYPES.LEARNING_MORE),
      ),
      knex.raw(
        'coalesce((??), \'[]\') as "challengeIds"',
        knex
          .select(knex.raw('json_agg(??)', 'challenges.id'))
          .from('challenges')
          .where('challenges.skillId', knex.ref('skills.id')),
      ),
    )
    .from('skills')
    .leftOuterJoin('tubes', 'tubes.id', 'skills.tubeId')
    .leftOuterJoin('thematics', 'thematics.id', 'tubes.thematicId');
}

export async function create(skill) {
  return knex.transaction(async (transaction) => {
    const createdSkillDTO = await skillDatasource.create(skill);

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
        tubeId: createdSkillDTO.tubeId,
      })
      .into(TABLE_NAME);

    const translations = skillTranslations.extractFromDomainObject(skill);
    await translationRepository.save({ translations, transaction });

    const skillTutorials = [
      ...createdSkillDTO.tutorialIds.map((tutorialId) => ({
        skillId: skill.id,
        tutorialId,
        type: TUTORIAL_RELATION_TYPES.UNDERSTANDING,
      })),
      ...createdSkillDTO.learningMoreTutorialIds.map((tutorialId) => ({
        skillId: skill.id,
        tutorialId,
        type: TUTORIAL_RELATION_TYPES.LEARNING_MORE,
      })),
    ];
    if (skillTutorials.length > 0) {
      await transaction.insert(skillTutorials).into(TUTORIALS_RELATION_TABLE_NAME);
    }

    return toDomain(createdSkillDTO, translations);
  });
}

export async function update(skill) {
  return knex.transaction(async (transaction) => {
    const [updatedSkillDto, [skillDataFromPG]] = await Promise.all([
      skillDatasource.update(skill),
      transaction(TABLE_NAME)
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
        })
        .where('id', skill.id)
        .returning([
          'activatedAt',
          'archivedAt',
          'obsoletedAt',
        ]),
    ]);

    const translations = skillTranslations.extractFromDomainObject(skill);
    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${skillTranslations.prefix}${skill.id}.`,
      locales: ['fr', 'en'],
      transaction,
    });
    await translationRepository.save({ translations, transaction });

    const skillTutorials = [
      ...updatedSkillDto.tutorialIds.map((tutorialId) => ({
        skillId: skill.id,
        tutorialId,
        type: TUTORIAL_RELATION_TYPES.UNDERSTANDING,
      })),
      ...updatedSkillDto.learningMoreTutorialIds.map((tutorialId) => ({
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

    return toDomain(updatedSkillDto, translations, skillDataFromPG);
  });
}

function compareSkillDtos(airtableDto, pgDto) {
  const diff = [];
  if (airtableDto.id !== pgDto.id) diff.push(`airtable id "${airtableDto.id}" != postgres id "${pgDto.id}"`);
  if (!areNullableValuesEqual(airtableDto.status, pgDto.status))
    diff.push(`airtable status "${airtableDto.status}" != postgres status "${pgDto.status}"`);
  if (!areNullableValuesEqual(airtableDto.hintStatus, pgDto.hintStatus))
    diff.push(`airtable hintStatus "${airtableDto.hintStatus}" != postgres hintStatus "${pgDto.hintStatus}"`);
  if (!areNullableValuesEqual(airtableDto.descriptionStatus, pgDto.descriptionStatus))
    diff.push(
      `airtable descriptionStatus "${airtableDto.descriptionStatus}" != postgres descriptionStatus "${pgDto.descriptionStatus}"`,
    );
  if (!areNullableValuesEqual(airtableDto.description, pgDto.description))
    diff.push(`airtable description "${airtableDto.description}" != postgres description "${pgDto.description}"`);
  if (!areNullableValuesEqual(airtableDto.level, pgDto.level))
    diff.push(`airtable level "${airtableDto.level}" != postgres level "${pgDto.level}"`);
  if (!areNullableValuesEqual(airtableDto.internationalisation, pgDto.internationalisation))
    diff.push(
      `airtable internationalisation "${airtableDto.internationalisation}" != postgres internationalisation "${pgDto.internationalisation}"`,
    );
  if (!areNullableValuesEqual(airtableDto.version, pgDto.version))
    diff.push(`airtable version "${airtableDto.version}" != postgres version "${pgDto.version}"`);
  if (!areNullableValuesEqual(airtableDto.tubeId, pgDto.tubeId))
    diff.push(`airtable tubeId "${airtableDto.tubeId}" != postgres tubeId "${pgDto.tubeId}"`);
  if (airtableDto.name !== pgDto.name)
    diff.push(`airtable name "${airtableDto.name}" != postgres name "${pgDto.name}"`);
  if (!areNullableValuesEqual(airtableDto.competenceId, pgDto.competenceId))
    diff.push(
      `airtable competenceId "${airtableDto.competenceId}" != postgres competenceId "${pgDto.competenceId}"`,
    );
  if (!areArrayEquals(airtableDto.tutorialIds, pgDto.tutorialIds))
    diff.push(`airtable tutorialIds "${airtableDto.tutorialIds}" != postgres tutorialIds "${pgDto.tutorialIds}"`);
  if (!areArrayEquals(airtableDto.learningMoreTutorialIds, pgDto.learningMoreTutorialIds))
    diff.push(
      `airtable learningMoreTutorialIds "${airtableDto.learningMoreTutorialIds}" != postgres learningMoreTutorialIds "${pgDto.learningMoreTutorialIds}"`,
    );
  if (!areArrayEquals(airtableDto.challengeIds, pgDto.challengeIds))
    diff.push(
      `airtable challengeIds "${airtableDto.challengeIds}" != postgres challengeIds "${pgDto.challengeIds}"`,
    );
  return diff;
}

function toDomainList(datasourceSkills, translations, skillsDataFromPG) {
  const translationsBySkillId = _.groupBy(translations, 'entityId');
  const skillDataFromPGBySkillId = _.groupBy(skillsDataFromPG, 'id');
  return datasourceSkills.map((datasourceSkill) =>
    toDomain(
      datasourceSkill,
      translationsBySkillId[datasourceSkill.id],
      skillDataFromPGBySkillId[datasourceSkill.id]?.[0] ?? null,
    ),
  );
}

function toDomain(datasourceSkill, translations = [], skillDataFromPG) {
  return new Skill({
    ...datasourceSkill,
    ...skillTranslations.toDomain(translations),
    activatedAt: skillDataFromPG?.activatedAt ?? null,
    archivedAt: skillDataFromPG?.archivedAt ?? null,
    obsoletedAt: skillDataFromPG?.obsoletedAt ?? null,
  });
}
