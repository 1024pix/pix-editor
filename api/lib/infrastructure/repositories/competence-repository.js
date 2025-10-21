import _ from 'lodash';

import { competenceDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as competenceTranslations from '../translations/competence.js';
import { Competence } from '../../domain/models/index.js';
import * as idGenerator from '../utils/id-generator.js';
import { knex } from '../../../db/knex-database-connection.js';
import { areArrayEquals, compareDtos, compareDtosLists } from './migration-from-airtable.js';

const model = 'competence';
const TABLE_NAME = 'competences';

export async function list() {
  const [airtableDtos, pgDtos, translations] = await Promise.all([
    competenceDatasource.list(),
    selectCompetences().orderBy('competences.index'),
    translationRepository.listByModel(model),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareCompetenceDtos);

  return toDomainList(airtableDtos, translations);
}

export async function getMany(ids) {
  const [airtableDtos, pgDtos, translations] = await Promise.all([
    competenceDatasource.filter({ filter: { ids } }),
    selectCompetences().whereIn('competences.id', ids).orderBy('competences.index'),
    translationRepository.listByEntities(model, ids),
  ]);

  compareDtosLists(airtableDtos, pgDtos, compareCompetenceDtos);

  return toDomainList(airtableDtos, translations);
}

export async function get(id) {
  const [[airtableDto], pgDto, translations] = await Promise.all([
    competenceDatasource.filter({ filter: { ids: [id] } }),
    selectCompetences().where('competences.id', id).first(),
    translationRepository.listByEntity(model, id),
  ]);

  compareDtos(airtableDto, pgDto, compareCompetenceDtos);

  if (!airtableDto) return null;

  return toDomain(airtableDto, translations);
}

export async function getByAirtableId(airtableId) {
  const airtableDto = await competenceDatasource.find(airtableId);
  if (!airtableDto) return null;

  const [pgDto, translations] = await Promise.all([
    selectCompetences().where('competences.id', airtableDto.id).first(),
    translationRepository.listByEntity(model, airtableDto.id),
  ]);

  compareDtos(airtableDto, pgDto, compareCompetenceDtos);

  return toDomain(airtableDto, translations);
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

function selectCompetences() {
  return knex.select(
    'competences.*',
    'frameworks.name as origin',
    knex.raw(
      'coalesce((??), \'[]\') as "thematicIds"',
      knex
        .select(knex.raw('json_agg(??)', 'thematics.id'))
        .from('thematics')
        .where('thematics.competenceId', '=', knex.ref('competences.id')),
    ),
    knex.raw(
      'coalesce((??), \'[]\') as "tubeIds"',
      knex
        .select(knex.raw('json_agg(??)', 'tubes.id'))
        .from('thematics')
        .join('tubes', 'tubes.thematicId', 'thematics.id')
        .where('thematics.competenceId', '=', knex.ref('competences.id')),
    ),
    knex.raw(
      'coalesce((??), \'[]\') as "skillIds"',
      knex
        .select(knex.raw('json_agg(??)', 'skills.id'))
        .from('thematics')
        .join('tubes', 'tubes.thematicId', 'thematics.id')
        .join('skills', 'skills.tubeId', 'tubes.id')
        .where('thematics.competenceId', '=', knex.ref('competences.id')),
    ),
  )
    .from('competences')
    .join('areas', 'areas.id', 'competences.areaId')
    .join('frameworks', 'frameworks.id', 'areas.frameworkId');
}

function compareCompetenceDtos(airtableCompetence, pgCompetence) {
  const diff = [];
  if (airtableCompetence.id !== pgCompetence.id) diff.push(`competence airtable id "${airtableCompetence.id}" != postgres id "${pgCompetence.id}"`);
  if (airtableCompetence.index !== pgCompetence.index) diff.push(`competence airtable index "${airtableCompetence.index}" != postgres index "${pgCompetence.index}"`);
  if (airtableCompetence.areaId !== pgCompetence.areaId) diff.push(`competence airtable areaId "${airtableCompetence.areaId}" != postgres areaId "${pgCompetence.areaId}"`);
  if (airtableCompetence.origin !== pgCompetence.origin) diff.push(`competence airtable origin "${airtableCompetence.origin}" != postgres origin "${pgCompetence.origin}"`);
  if (!areArrayEquals(airtableCompetence.thematicIds, pgCompetence.thematicIds)) diff.push(`competence airtable thematicIds "${airtableCompetence.thematicIds}" != postgres thematicIds "${pgCompetence.thematicIds}"`);
  if (!areArrayEquals(airtableCompetence.tubeIds, pgCompetence.tubeIds)) diff.push(`competence airtable tubeIds "${airtableCompetence.tubeIds}" != postgres tubeIds "${pgCompetence.tubeIds}"`);
  if (!areArrayEquals(airtableCompetence.skillIds, pgCompetence.skillIds)) diff.push(`competence airtable skillIds "${airtableCompetence.skillIds}" != postgres skillIds "${pgCompetence.skillIds}"`);
  return diff;
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
