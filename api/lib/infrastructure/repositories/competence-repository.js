import _ from 'lodash';

import { competenceDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as competenceTranslations from '../translations/competence.js';
import { Competence } from '../../domain/models/Competence.js';

export async function list() {
  const datasourceCompetences = await competenceDatasource.list();
  const translations = await translationRepository.listByPrefix(competenceTranslations.prefix);
  return toDomainList(datasourceCompetences, translations);
}

export async function getMany(ids) {
  const datasourceCompetences = await competenceDatasource.filter({ filter: { ids } });
  const translations = await translationRepository.listByPrefix(competenceTranslations.prefix);
  return toDomainList(datasourceCompetences, translations);
}

function toDomainList(datasourceCompetences, translations) {
  const translationsByCompetenceId = _.groupBy(translations, ({ key }) => key.split('.')[1]);
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
