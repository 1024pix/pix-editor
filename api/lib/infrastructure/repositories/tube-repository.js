import _ from 'lodash';
import * as translationRepository from './translation-repository.js';
import * as tubeTranslations from '../translations/tube.js';
import { Tube } from '../../domain/models/Tube.js';
import { TubeForReplication } from '../../domain/models/replication/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';

const model = 'tube';
const TABLE_NAME = 'tubes';

export async function list() {
  const [dtos, translations] = await Promise.all([selectTubes().orderBy(`${TABLE_NAME}.id`), translationRepository.listByModel(model)]);

  return toDomainList(dtos, translations);
}

export async function listForReplication() {
  const knexConn = DomainTransaction.getConnection();
  const dtos = await knexConn
    .select(`${TABLE_NAME}.id`, `${TABLE_NAME}.name`, `${TABLE_NAME}.thematicId`, 'thematics.competenceId')
    .from(TABLE_NAME)
    .join('thematics', 'thematics.id', `${TABLE_NAME}.thematicId`)
    .orderBy(`${TABLE_NAME}.id`);
  const translations = await translationRepository.listByModel(model);

  return toDomainListForReplication(dtos, translations);
}

export async function get(id) {
  const [dto, translations] = await Promise.all([selectTubes().where('tubes.id', id).first(), translationRepository.listByEntity(model, id)]);

  if (!dto) return null;

  return toDomain(dto, translations);
}

export async function listByCompetenceId(competenceId) {
  const dtos = await selectTubes().where('thematics.competenceId', competenceId).orderBy('tubes.id');

  if (dtos.length === 0) return [];

  const translations = await translationRepository.listByEntities(
    model,
    dtos.map(({ id }) => id),
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
  return DomainTransaction.execute(async () => {
    tube.id = idGenerator.generateNewId('tube');
    const translations = tubeTranslations.extractFromDomainObject(tube);

    const knexConn = DomainTransaction.getConnection();
    await Promise.all([
      knexConn
        .insert({
          id: tube.id,
          name: tube.name,
          index: tube.index,
          thematicId: tube.thematicAirtableId,
        })
        .into(TABLE_NAME),
      translationRepository.save({ translations }),
    ]);

    const dto = await selectTubes().where('tubes.id', tube.id).first();

    return toDomain(dto, translations);
  });
}

export async function update(tube) {
  return DomainTransaction.execute(async () => {
    const translations = tubeTranslations.extractFromDomainObject(tube);

    const knexConn = DomainTransaction.getConnection();
    await knexConn(TABLE_NAME)
      .update({
        name: tube.name,
        index: tube.index,
        thematicId: tube.thematicAirtableId,
      })
      .where('id', tube.id);
    const dto = await selectTubes().where('tubes.id', tube.id).first();

    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${tubeTranslations.prefix}${tube.id}.`,
      locales: ['fr', 'en'],
    });
    await translationRepository.save({ translations });

    return toDomain(dto, translations);
  });
}

function selectTubes() {
  const knexConn = DomainTransaction.getConnection();
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

/**
 * @param {object[]} dtos
 * @param {object[]} translations
 */
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

function toDomainListForReplication(dtos, translations) {
  const translationsByTubeId = Object.groupBy(translations, (translation) => translation.entityId);
  return dtos.map((dto) => toDomainForReplication(dto, translationsByTubeId[dto.id]));
}

function toDomainForReplication(dto, translations = []) {
  return new TubeForReplication({
    ...dto,
    ...tubeTranslations.toDomain(translations),
  });
}
