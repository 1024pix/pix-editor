import _ from 'lodash';
import { tubeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as tubeTranslations from '../translations/tube.js';
import { Tube } from '../../domain/models/Tube.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';

const model = 'tube';

export async function list() {
  const [datasourceTubes, translations] = await Promise.all([
    tubeDatasource.list(),
    translationRepository.listByModel(model),
  ]);
  return toDomainList(datasourceTubes, translations);
}

export async function get(id) {
  const [[tubeDTO], translations] = await Promise.all([
    tubeDatasource.filter({ filter: { ids: [id] } }),
    translationRepository.listByEntity(model, id),
  ]);
  if (!tubeDTO) return null;
  return toDomain(tubeDTO, translations);
}

export async function listByCompetenceId(competenceId) {
  const datasourceTubes = await tubeDatasource.listByCompetenceId(competenceId);
  if (!datasourceTubes) return [];
  const translations = await translationRepository.listByEntities(model, datasourceTubes.map(({ id }) => id));
  return toDomainList(datasourceTubes, translations);
}

export async function getByAirtableId(airtableId) {
  const datasourceTube = await tubeDatasource.find(airtableId);
  if (!datasourceTube) return null;
  const translations = await translationRepository.listByEntity(model, datasourceTube.id);
  return toDomain(datasourceTube, translations);
}

export async function getManyByAirtableIds(airtableIds) {
  if (!airtableIds?.length) return [];
  const datasourceTubes = await tubeDatasource.getManyByAirtableIds(airtableIds);
  if (!datasourceTubes) return [];
  const translations = await translationRepository.listByEntities(model, datasourceTubes.map(({ id }) => id));
  return toDomainList(datasourceTubes, translations);
}

export async function create(tube) {
  tube.id = idGenerator.generateNewId('tube');
  const createdTubeDTO = await tubeDatasource.create(tube);
  const translations = tubeTranslations.extractFromDomainObject(tube);
  await translationRepository.save({ translations });
  return toDomain(createdTubeDTO, translations);
}

export async function update(tube) {
  return knex.transaction(async (transaction) => {
    const updatedTubeDto = await tubeDatasource.update(tube);
    const translations = tubeTranslations.extractFromDomainObject(tube);
    await translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${tubeTranslations.prefix}${tube.id}.`,
      locales: ['fr', 'en'],
      transaction,
    });
    await translationRepository.save({ translations, transaction });
    return toDomain(updatedTubeDto, translations);
  });
}

function toDomainList(datasourceTubes, translations) {
  const translationsByTubeId = _.groupBy(translations, 'entityId');
  return datasourceTubes.map(
    (datasourceTube) => toDomain(datasourceTube, translationsByTubeId[datasourceTube.id]),
  );
}

function toDomain(datasourceTube, translations = []) {
  return new Tube({
    ...datasourceTube,
    ...tubeTranslations.toDomain(translations),
  });
}
