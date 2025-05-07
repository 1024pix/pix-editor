import _ from 'lodash';
import { translationDatasource } from '../../datasources/airtable/index.js';
import { Translation } from '../../../domain/models/index.js';
import { KnexRepository } from './KnexRepository.js';

const projection = ['key', 'locale', 'value'];

export class TranslationRepository extends KnexRepository {
  static doesTableExistInAirtable;
  static doesTableExistInAirtablePromise;

  async save({ translations, shouldDuplicateToAirtable = true }) {
    if (translations.length === 0) return [];

    await this.dbConn('translations')
      .insert(translations)
      .onConflict(['key', 'locale'])
      .merge();

    if (!shouldDuplicateToAirtable) return;

    if (TranslationRepository.doesTableExistInAirtable == null && TranslationRepository.doesTableExistInAirtablePromise == null) {
      await this.checkIfTableExistInAirtable();
    }

    if (TranslationRepository.doesTableExistInAirtable) {
      await translationDatasource.upsert(translations);
    }
  }

  /**
   * @deprecated use one of {@link listByModel}, {@link listByEntity} or {@link listByEntities}
   */
  async listByPrefix(prefix) {
    const translationDtos = await this.dbConn
      .select(projection)
      .from('translations')
      .whereLike('key', `${prefix}%`);
    return translationDtos.map(_toDomain);
  }

  async listByModel(model) {
    const translationDtos = await this.dbConn
      .select(projection)
      .from('translations')
      .where('model', model);
    return translationDtos.map(_toDomain);
  }

  async listByEntity(model, entityId) {
    const translationDtos = await this.dbConn
      .select(projection)
      .from('translations')
      .where('model', model)
      .andWhere('entityId', entityId);
    return translationDtos.map(_toDomain);
  }

  async listByEntities(model, entityIds) {
    const translationDtos = await this.dbConn
      .select(projection)
      .from('translations')
      .where('model', model)
      .andWhere('entityId', 'in', entityIds);
    return translationDtos.map(_toDomain);
  }

  async listByPattern(pattern) {
    const translationDtos = await this.dbConn
      .select(projection)
      .from('translations')
      .whereLike('key', `${pattern}`);
    return translationDtos.map(_toDomain);
  }

  async list() {
    const translationDtos = await this.dbConn.select(projection).from('translations').orderBy(['key', 'locale']);
    return translationDtos.map(_toDomain);
  }

  async search({ entity, fields, search, limit }) {
    const query = this.dbConn('translations')
      .pluck('key')
      .whereILike('value', `%${escapeWildcardCharacters(search)}%`)
      .andWhere(function() {
        for (const field of fields) {
          this.orWhereLike('key', `${entity}.%.${field}`);
        }
      })
      .orderBy('key');

    if (limit) query.limit(limit);

    const keys = await query;

    return _.sortedUniq(keys.map((key) => {
      return key.split('.')[1];
    }));
  }

  async checkIfTableExistInAirtable() {
    TranslationRepository.doesTableExistInAirtablePromise = translationDatasource.exists();
    TranslationRepository.doesTableExistInAirtable = await TranslationRepository.doesTableExistInAirtablePromise;
  }

  async deleteByKeyPrefixAndLocales({ prefix, locales }) {
    await this.dbConn('translations')
      .delete()
      .whereLike('key', `${prefix}%`)
      .whereIn('locale', locales);

    if (TranslationRepository.doesTableExistInAirtable == null && TranslationRepository.doesTableExistInAirtablePromise == null) {
      await this.checkIfTableExistInAirtable();
    }

    if (TranslationRepository.doesTableExistInAirtable) {
      const records = await translationDatasource.filter({
        filter: {
          formula: `AND(REGEX_MATCH(key, '^${prefix.replace(/(\.)/g, '\\$1')}'), OR(${locales.map((locale) => `locale = '${locale}'`).join(', ')}))`,
        },
      });
      if (records.length === 0) return;
      const recordIds = records.map(({ airtableId }) => airtableId);
      await translationDatasource.delete(recordIds);
    }
  }
}

function escapeWildcardCharacters(s) {
  return s.replace(/(%|_)/g, '\\$1');
}

function _toDomain(dto) {
  return new Translation(dto);
}

