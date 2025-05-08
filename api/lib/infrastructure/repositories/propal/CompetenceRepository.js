import _ from 'lodash';

import { competenceDatasource } from '../../datasources/airtable/index.js';
import * as competenceTranslations from '../../translations/competence.js';
import { Competence } from '../../../domain/models/index.js';
import * as idGenerator from '../../utils/id-generator.js';
import { KnexRepository } from './KnexRepository.js';
import { TranslationRepository } from './TranslationRepository.js';

export class CompetenceRepository extends KnexRepository {
  static model = 'competence';

  constructor({ knexTransaction } = {}) {
    super({ knexTransaction });
    this.translationRepository = new TranslationRepository({ knexTransaction: this.dbConn });
  }

  async list() {
    const [datasourceCompetences, translations] = await Promise.all([
      competenceDatasource.list(),
      this.translationRepository.listByModel(CompetenceRepository.model),
    ]) ;
    return toDomainList(datasourceCompetences, translations);
  }

  async getMany(ids) {
    const [datasourceCompetences, translations] = await Promise.all([
      competenceDatasource.filter({ filter: { ids } }),
      this.translationRepository.listByEntities(CompetenceRepository.model, ids),
    ]);
    return toDomainList(datasourceCompetences, translations);
  }

  async get(id) {
    const [[competenceDTO], translations] = await Promise.all([
      competenceDatasource.filter({ filter: { ids: [id] } }),
      this.translationRepository.listByEntity(CompetenceRepository.model, id),
    ]);
    if (!competenceDTO) return null;
    return toDomain(competenceDTO, translations);
  }

  async getByAirtableId(airtableId) {
    const competenceDTO = await competenceDatasource.find(airtableId);
    if (!competenceDTO) return null;
    const translations = await this.translationRepository.listByEntity(CompetenceRepository.model, competenceDTO.id);
    return toDomain(competenceDTO, translations);
  }

  async listByAreaAirtableId(areaAirtableId) {
    const competenceDTOs = await competenceDatasource.listByAreaAirtableId(areaAirtableId);
    const translations = await this.translationRepository.listByEntities(CompetenceRepository.model, competenceDTOs.map(({ id }) => id));
    return toDomainList(competenceDTOs, translations);
  }

  async create(competence) {
    competence.id = idGenerator.generateNewId('competence');

    const translations = competenceTranslations.extractFromDomainObject(competence);

    const createdCompetenceDto = await competenceDatasource.create(competence);

    await this.translationRepository.save({ translations });

    return toDomain(createdCompetenceDto, translations);
  }

  async update(competence) {
    const translations = competenceTranslations.extractFromDomainObject(competence);

    await this.translationRepository.deleteByKeyPrefixAndLocales({
      prefix: `${competenceTranslations.prefix}${competence.id}.`,
      locales: ['fr', 'en'],
    });
    await this.translationRepository.save({ translations });

    return competence;
  }
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
