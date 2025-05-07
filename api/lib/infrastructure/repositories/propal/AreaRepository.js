import _ from 'lodash';
import { areaDatasource } from '../../datasources/airtable/index.js';
import * as areaTranslations from '../../translations/area.js';
import { Area } from '../../../domain/models/index.js';
import * as idGenerator from '../../utils/id-generator.js';
import { KnexRepository } from './KnexRepository.js';
import { TranslationRepository } from './TranslationRepository.js';

export class AreaRepository extends KnexRepository {
  static model = 'area';

  constructor({ knexTransaction } = {}) {
    super({ knexTransaction });
    this.translationRepository = new TranslationRepository({ knexTransaction: this.dbConn });
  }

  async create(area) {
    area.id = idGenerator.generateNewId('area');
    const translations = areaTranslations.extractFromDomainObject(area);
    const createdAreaDto = await areaDatasource.create(area);
    await this.translationRepository.save({ translations });

    return toDomain(createdAreaDto, translations);
  }

  async list() {
    const [datasourceAreas, translations] = await Promise.all([
      areaDatasource.list(),
      this.translationRepository.listByModel(AreaRepository.model),
    ]);
    return toDomainList(datasourceAreas, translations);
  }

  async listByFrameworkId(frameworkId) {
    const [datasourceAreas, translations] = await Promise.all([
      areaDatasource.listByFrameworkId(frameworkId),
      this.translationRepository.listByModel(AreaRepository.model),
    ]);
    return toDomainList(datasourceAreas, translations);
  }

  async getByAirtableId(areaAirtableId) {
    const areaDTO = await areaDatasource.find(areaAirtableId);
    if (!areaDTO) return null;
    const translations = await this.translationRepository.listByEntity(AreaRepository.model, areaDTO.id);
    return toDomain(areaDTO, translations);
  }
}

function toDomain(datasourceArea, translations = []) {
  return new Area({
    ...datasourceArea,
    ...areaTranslations.toDomain(translations, datasourceArea),
  });
}

function toDomainList(datasourceAreas, translations) {
  const translationsByAreaId = _.groupBy(translations, 'entityId');
  return datasourceAreas.map(
    (datasourceArea) => toDomain(datasourceArea, translationsByAreaId[datasourceArea.id]),
  );
}
