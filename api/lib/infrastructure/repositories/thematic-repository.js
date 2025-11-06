import _ from 'lodash';

import * as translationRepository from './translation-repository.js';
import * as thematicTranslations from '../translations/thematic.js';
import { Thematic } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';

const model = 'thematic';
const TABLE_NAME = 'thematics';

export async function list() {
  const [dtos, translations] = await Promise.all([selectThematics().orderBy('id'), translationRepository.listByModel(model)]);

  return toDomainList(dtos, translations);
}

/**
 * @deprecated use {@link get}
 */
export async function getByAirtableId(id) {
  return get(id);
}

export async function get(id) {
  const [dto, translations] = await Promise.all([selectThematics().where('id', id).first(), translationRepository.listByEntity(model, id)]);

  if (!dto) return null;

  return toDomain(dto, translations);
}

export async function getMany(ids) {
  if (!ids?.length) return [];

  const [dtos, translations] = await Promise.all([selectThematics().whereIn('id', ids).orderBy('id'), translationRepository.listByEntities(model, ids)]);

  return toDomainList(dtos, translations);
}

/**
 * @deprecated use {@link getMany}
 */
export async function getManyByAirtableIds(ids) {
  return getMany(ids);
}

export async function listByCompetenceId(competenceId) {
  const dtos = await selectThematics().where('competenceId', competenceId).orderBy('id');

  if (dtos.length === 0) return [];

  const translations = await translationRepository.listByEntities(
    model,
    dtos.map(({ id }) => id),
  );

  return toDomainList(dtos, translations);
}

/**
 * @deprecated use {@link listByCompetenceId}
 */
export async function listByCompetenceAirtableId(id) {
  return listByCompetenceId(id);
}

export async function create(thematic) {
  return knex.transaction(async (transaction) => {
    thematic.id = idGenerator.generateNewId('thematic');
    const translations = thematicTranslations.extractFromDomainObject(thematic);

    await Promise.all([
      transaction
        .insert({
          id: thematic.id,
          index: thematic.index,
          competenceId: thematic.competenceAirtableId,
        })
        .into(TABLE_NAME),
      translationRepository.save({ translations, transaction }),
    ]);

    const dto = await selectThematics(transaction).where('id', thematic.id).first();

    return toDomain(dto, translations);
  });
}

export async function update(thematic) {
  return knex.transaction(async (transaction) => {
    const translations = thematicTranslations.extractFromDomainObject(thematic);

    await transaction(TABLE_NAME)
      .update({ index: thematic.index, updatedAt: transaction.fn.now() })
      .where('id', thematic.id);
    const dto = await selectThematics(transaction).where('id', thematic.id).first();

    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${thematicTranslations.prefix}${thematic.id}.`,
      locales: ['fr', 'en'],
      transaction,
    });
    await translationRepository.save({ translations, transaction });

    return toDomain(dto, translations);
  });
}

function selectThematics(knexConn = knex) {
  return knexConn
    .select(
      '*',
      knexConn.raw(
        'coalesce((??), \'[]\') as "tubeIds"',
        knexConn
          .select(knexConn.raw('json_agg(?? order by ??)', ['tubes.id', 'tubes.id']))
          .from('tubes')
          .where('tubes.thematicId', '=', knexConn.ref(`${TABLE_NAME}.id`)),
      ),
    )
    .from(TABLE_NAME);
}

function toDomainList(dtos, translations) {
  const translationsByThematicId = Object.groupBy(translations, (translation) => translation.entityId);
  return _.orderBy(
    dtos.map((dto) => toDomain(dto, translationsByThematicId[dto.id])),
    ['index', 'name_i18n.fr'],
  );
}

function toDomain({ id, competenceId, tubeIds = [], ...dto }, translations = []) {
  return new Thematic({
    id,
    airtableId: id,
    competenceId,
    competenceAirtableId: competenceId,
    tubeIds,
    tubeAirtableIds: tubeIds,
    ...dto,
    ...thematicTranslations.toDomain(translations),
  });
}
