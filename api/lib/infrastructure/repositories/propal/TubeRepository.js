import _ from 'lodash';
import { tubeDatasource } from '../../datasources/airtable/index.js';
import * as tubeTranslations from '../../translations/tube.js';
import { Tube } from '../../../domain/models/Tube.js';
import { KnexRepository } from './KnexRepository.js';
import { TranslationRepository } from './TranslationRepository.js';

export class TubeRepository extends KnexRepository {
  static model = 'tube';

  constructor({ knexTransaction } = {}) {
    super({ knexTransaction });
    this.translationRepository = new TranslationRepository({ knexTransaction: this.dbConn });
  }

  async list() {
    const [datasourceTubes, translations] = await Promise.all([
      tubeDatasource.list(),
      this.translationRepository.listByModel(TubeRepository.model),
    ]);
    return toDomainList(datasourceTubes, translations);
  }

  async get(id) {
    const [[tubeDTO], translations] = await Promise.all([
      tubeDatasource.filter({ filter: { ids: [id] } }),
      this.translationRepository.listByEntity(TubeRepository.model, id),
    ]);
    if (!tubeDTO) return null;
    return toDomain(tubeDTO, translations);
  }

  async listByCompetenceId(competenceId) {
    const datasourceTubes = await tubeDatasource.listByCompetenceId(competenceId);
    if (!datasourceTubes) return [];
    const translations = await this.translationRepository.listByEntities(TubeRepository.model, datasourceTubes.map(({ id }) => id));
    return toDomainList(datasourceTubes, translations);
  }

  async getByAirtableId(airtableId) {
    const datasourceTube = await tubeDatasource.find(airtableId);
    if (!datasourceTube) return null;
    const translations = await this.translationRepository.listByEntity(TubeRepository.model, datasourceTube.id);
    return toDomain(datasourceTube, translations);
  }
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
