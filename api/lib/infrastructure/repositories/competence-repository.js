import _ from 'lodash';

import { competenceDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as competenceTranslations from '../translations/competence.js';
import { Competence } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';

const model = 'competence';
const TABLE_NAME = 'competences';

export async function list() {
  const [datasourceCompetences, translations] = await Promise.all([
    competenceDatasource.list(),
    translationRepository.listByModel(model),
  ]) ;
  return toDomainList(datasourceCompetences, translations);
}

export async function getMany(ids) {
  const [datasourceCompetences, translations] = await Promise.all([
    competenceDatasource.filter({ filter: { ids } }),
    translationRepository.listByEntities(model, ids),
  ]);
  return toDomainList(datasourceCompetences, translations);
}

export async function get(id) {
  const [[competenceDTO], translations] = await Promise.all([
    competenceDatasource.filter({ filter: { ids: [id] } }),
    translationRepository.listByEntity(model, id),
  ]);
  if (!competenceDTO) return null;
  return toDomain(competenceDTO, translations);
}

export async function getByAirtableId(airtableId) {
  const competenceDTO = await competenceDatasource.find(airtableId);
  if (!competenceDTO) return null;
  const translations = await translationRepository.listByEntity(model, competenceDTO.id);
  return toDomain(competenceDTO, translations);
}

export async function listByAreaAirtableId(areaAirtableId) {
  const competenceDTOs = await competenceDatasource.listByAreaAirtableId(areaAirtableId);
  const translations = await translationRepository.listByEntities(model, competenceDTOs.map(({ id }) => id));
  return toDomainList(competenceDTOs, translations);
}

export async function create(competence) {
  competence.id = idGenerator.generateNewId('competence');

  const translations = competenceTranslations.extractFromDomainObject(competence);

  const createdCompetenceDto = await competenceDatasource.create(competence);

  await knex.insert({
    id: competence.id,
    index: competence.index,
    areaId: createdCompetenceDto.areaId,
  }).into(TABLE_NAME);

  await translationRepository.save({ translations });

  return toDomain(createdCompetenceDto, translations);
}

export async function update(competence) {
  const translations = competenceTranslations.extractFromDomainObject(competence);

  await translationRepository.deleteByKeyPrefixAndLocales({
    prefix: `${competenceTranslations.prefix}${competence.id}.`,
    locales: ['fr', 'en'],
  });
  await translationRepository.save({ translations });

  return competence;
}

function toDomainList(datasourceCompetences, translations) {
  const translationsByCompetenceId = _.groupBy(translations, 'entityId');
  return datasourceCompetences.map(
    (datasourceCompetence) => toDomain(datasourceCompetence, translationsByCompetenceId[datasourceCompetence.id]),
  );
}

function toDomain(datasourceCompetence, translations = []) {
  return new Competence({
    ...datasourceCompetence,
    ...competenceTranslations.toDomain(translations),
  });
}
