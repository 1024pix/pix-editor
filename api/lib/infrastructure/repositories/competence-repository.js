import _ from 'lodash';

import { competenceDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as competenceTranslations from '../translations/competence.js';
import { Competence } from '../../domain/models/index.js';

const model = 'competence';

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

export async function getById(id) {
  const [[datasourceCompetence], translations] = await Promise.all([
    competenceDatasource.filter({ filter: { ids: [id] } }),
    translationRepository.listByEntity(model, id),
  ]);
  return toDomain(datasourceCompetence, translations);
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
