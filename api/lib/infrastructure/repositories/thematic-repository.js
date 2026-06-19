import _ from 'lodash';

import * as translationRepository from './translation-repository.js';
import * as thematicTranslations from '../translations/thematic.js';
import { Thematic } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';

const model = 'thematic';
const TABLE_NAME = 'thematics';

export async function list() {
  const [dtos, translations] = await Promise.all([selectThematics().orderBy('id'), translationRepository.listByModel(model)]);

  return toDomainList(dtos, translations);
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

export async function listByCompetenceId(competenceId) {
  const dtos = await selectThematics().where('competenceId', competenceId).orderBy('id');

  if (dtos.length === 0) return [];

  const translations = await translationRepository.listByEntities(
    model,
    dtos.map(({ id }) => id),
  );

  return toDomainList(dtos, translations);
}

export async function create(thematic) {
  return DomainTransaction.execute(async () => {
    thematic.id = idGenerator.generateNewId('thematic');
    const translations = thematicTranslations.extractFromDomainObject(thematic);

    const knexConn = DomainTransaction.getConnection();
    await Promise.all([
      knexConn
        .insert({
          id: thematic.id,
          index: thematic.index,
          competenceId: thematic.competenceAirtableId,
        })
        .into(TABLE_NAME),
      translationRepository.save({ translations }),
    ]);

    const dto = await selectThematics().where('id', thematic.id).first();

    return toDomain(dto, translations);
  });
}

export async function update(thematic) {
  return DomainTransaction.execute(async () => {
    const translations = thematicTranslations.extractFromDomainObject(thematic);

    const knexConn = DomainTransaction.getConnection();
    await knexConn(TABLE_NAME)
      .update({ index: thematic.index, updatedAt: knexConn.fn.now() })
      .where('id', thematic.id);
    const dto = await selectThematics().where('id', thematic.id).first();

    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${thematicTranslations.prefix}${thematic.id}.`,
      locales: ['fr', 'en'],
    });
    await translationRepository.save({ translations });

    return toDomain(dto, translations);
  });
}

function selectThematics() {
  const knexConn = DomainTransaction.getConnection();
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

/**
 * @param {object[]} dtos
 * @param {object[]} translations
 */
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
