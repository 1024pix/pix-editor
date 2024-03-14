import { tubeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import _ from 'lodash';
import * as tubeTranslations from '../translations/tube.js';
import { Tube } from '../../domain/models/Tube.js';

export async function list() {
  const datasourceTubes = await tubeDatasource.list();
  const translations = await translationRepository.listByPrefix(tubeTranslations.prefix);
  return toDomainList(datasourceTubes, translations);
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
