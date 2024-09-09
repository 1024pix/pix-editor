import _ from 'lodash';
import { tubeDatasource } from '../datasources/airtable/index.js';
import * as translationRepository from './translation-repository.js';
import * as tubeTranslations from '../translations/tube.js';
import { Tube } from '../../domain/models/Tube.js';

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

export async function getMany(ids) {
  const datasourceTubes = await tubeDatasource.filter({ filter: { ids } });
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
