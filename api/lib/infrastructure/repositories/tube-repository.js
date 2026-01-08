import _ from 'lodash';
import * as translationRepository from './translation-repository.js';
import * as tubeTranslations from '../translations/tube.js';
import { Tube } from '../../domain/models/Tube.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';

const model = 'tube';
const TABLE_NAME = 'tubes';

export async function list({ transaction: knexConn } = {}) {
  const [dtos, translations] = await Promise.all([selectTubes(knexConn).orderBy(`${TABLE_NAME}.id`), translationRepository.listByModel(model, { knexConn })]);

  return toDomainList(dtos, translations);
}

export async function get(id) {
  const [dto, translations] = await Promise.all([selectTubes().where('tubes.id', id).first(), translationRepository.listByEntity(model, id)]);

  if (!dto) return null;

  return toDomain(dto, translations);
}

export async function listByCompetenceId(competenceId, { transaction: knexConn = knex } = {}) {
  const dtos = await selectTubes(knexConn).where('thematics.competenceId', competenceId).orderBy('tubes.id');

  if (dtos.length === 0) return [];

  const translations = await translationRepository.listByEntities(
    model,
    dtos.map(({ id }) => id),
    { knexConn },
  );

  return toDomainList(dtos, translations);
}

export async function getMany(ids) {
  if (!ids?.length) return [];

  const [dtos, translations] = await Promise.all([selectTubes().whereIn('tubes.id', ids).orderBy('tubes.id'), translationRepository.listByEntities(model, ids)]);

  if (!dtos) return [];

  return toDomainList(dtos, translations);
}

export async function create(tube) {
  return knex.transaction(async (transaction) => {
    tube.id = idGenerator.generateNewId('tube');
    const translations = tubeTranslations.extractFromDomainObject(tube);

    await Promise.all([
      transaction
        .insert({
          id: tube.id,
          name: tube.name,
          index: tube.index,
          thematicId: tube.thematicAirtableId,
        })
        .into(TABLE_NAME),
      translationRepository.save({ translations, transaction }),
    ]);

    const dto = await selectTubes(transaction).where('tubes.id', tube.id).first();

    return toDomain(dto, translations);
  });
}

export async function update(tube) {
  return knex.transaction(async (transaction) => {
    const translations = tubeTranslations.extractFromDomainObject(tube);

    await transaction(TABLE_NAME)
      .update({
        name: tube.name,
        index: tube.index,
        thematicId: tube.thematicAirtableId,
      })
      .where('id', tube.id);
    const dto = await selectTubes(transaction).where('tubes.id', tube.id).first();

    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${tubeTranslations.prefix}${tube.id}.`,
      locales: ['fr', 'en'],
      transaction,
    });
    await translationRepository.save({ translations, transaction });

    return toDomain(dto, translations);
  });
}

function selectTubes(knexConn = knex) {
  return knexConn
    .select(
      `${TABLE_NAME}.*`,
      'thematics.competenceId',
      knexConn.raw(
        'coalesce((??), \'[]\') as "skillIds"',
        knexConn
          .select(knexConn.raw('json_agg(?? order by ??)', ['skills.id', 'skills.id']))
          .from('skills')
          .where('skills.tubeId', '=', knexConn.ref(`${TABLE_NAME}.id`)),
      ),
    )
    .from(TABLE_NAME)
    .join('thematics', 'thematics.id', `${TABLE_NAME}.thematicId`);
}

function toDomainList(dtos, translations) {
  const translationsByTubeId = Object.groupBy(translations, (translation) => translation.entityId);
  return dtos.map((dto) => toDomain(dto, translationsByTubeId[dto.id]));
}

function toDomain({ id, thematicId, competenceId, skillIds = [], ...dto }, translations = []) {
  return new Tube({
    id,
    airtableId: id,
    thematicId,
    thematicAirtableId: thematicId,
    competenceId,
    competenceAirtableId: competenceId,
    skillIds,
    skillAirtableIds: skillIds,
    ...dto,
    ...tubeTranslations.toDomain(translations),
  });
}
