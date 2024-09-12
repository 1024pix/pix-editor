import { afterEach, beforeEach, describe, describe as context, expect, it } from 'vitest';
import nock from 'nock';
import { knex, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as translationRepository from '../../../../lib/infrastructure/repositories/translation-repository.js';

describe('Integration | Repository | translation-repository', function() {

  afterEach(async function() {
    await knex('translations').delete();
  });

  context('#save', function() {
    it('should create or update translations', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.id.key1',
        locale: 'fr',
        value: 'key1 fr'
      });
      await databaseBuilder.commit();

      const translations = [
        {
          key: 'entity.id.key1',
          locale: 'fr',
          value: 'key1 fr'
        },
        {
          key: 'entity.id.key2',
          locale: 'fr',
          value: 'key2 fr'
        }
      ];

      // when
      await translationRepository.save({ translations });

      // then
      await expect(knex('translations').select('key', 'locale', 'value').orderBy('key')).resolves.to.deep.equal(translations);
    });

    context('when Airtable has a translations table', () => {
      beforeEach(async function() {
        await _setDoesTableExistInAirtable(true);
      });

      afterEach(async function() {
        await _setDoesTableExistInAirtable(false);
      });

      it('should save translations to airtable', async function() {
        // given
        nock('https://api.airtable.com')
          .patch('/v0/airtableBaseValue/translations/?', {
            records: [
              {
                fields: {
                  key: 'entity.recordid.key',
                  locale: 'fr',
                  value: 'translationValue'
                }
              }
            ],
            performUpsert: {
              fieldsToMergeOn: [
                'key',
                'locale'
              ]
            }
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records: [] });

        // when
        await translationRepository.save({ translations: [{ key: 'entity.recordid.key', locale: 'fr', value: 'translationValue' }] });

        // then
        expect(nock.isDone()).to.be.true;
      });
    });
  });

  context('#deleteByKeyPrefixAndLocales', function() {
    it('should delete translations having key prefix and locales', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'some.prefix.key',
        locale: 'fr',
        value: 'Bonjour, la mif'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'some.prefix.key',
        locale: 'en',
        value: 'Hello, the mif'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'some.prefix.key',
        locale: 'nl-be',
        value: 'Hallo, het mif'
      });
      await databaseBuilder.commit();

      const prefixToDelete = 'some.prefix.';
      const locales = ['fr', 'en'];

      // when
      await translationRepository.deleteByKeyPrefixAndLocales({ prefix: prefixToDelete, locales });

      // then
      expect(await knex('translations').select('key', 'locale', 'value')).to.deep.equal([
        {
          key: 'some.prefix.key',
          locale: 'nl-be',
          value: 'Hallo, het mif'
        },
      ]);
    });

    context('when Airtable has a translations table', () => {
      beforeEach(async function() {
        await _setDoesTableExistInAirtable(true);
      });

      afterEach(async function() {
        await _setDoesTableExistInAirtable(false);
      });

      it('should delete keys in Airtable', async () => {
        // given
        nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/translations')
          .query({
            fields: {
              '': [
                'key',
                'locale',
                'value',
              ],
            },
            filterByFormula: 'AND(REGEX_MATCH(key, \'^some\\.prefix\\.\'), OR(locale = \'fr\', locale = \'en\'))',
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, {
            records: [
              {
                id: 'recTranslation1',
                fields: {
                  key: 'some.prefix.key',
                  locale: 'fr',
                  value: 'Bonjour, la mif',
                },
              },
              {
                id: 'recTranslation2',
                fields: {
                  key: 'some.prefix.key',
                  locale: 'en',
                  value: 'Hello, the mif',
                },
              },
            ]
          });

        nock('https://api.airtable.com')
          .delete('/v0/airtableBaseValue/translations')
          .query({
            records: {
              '': ['recTranslation1', 'recTranslation2'],
            }
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, {
            records: [
              { id: 'recTranslation1', deleted: true },
              { id: 'recTranslation2', deleted: true },
            ],
          });

        const prefixToDelete = 'some.prefix.';
        const locales = ['fr', 'en'];

        // when
        await translationRepository.deleteByKeyPrefixAndLocales({ prefix: prefixToDelete, locales });

        expect(nock.isDone()).toBe(true);
      });
    });
  });

  context('#search', function() {
    it('should search for fields in entities', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'coucou'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key',
        locale: 'fr',
        value: 'coco'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key2',
        locale: 'fr',
        value: 'coucou'
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.search({
        entity: 'entity',
        fields: ['key'],
        search: 'coucou'
      });

      // then
      expect(entityIds).to.deep.equal(['entityId1']);
    });

    it('should return distinct entity ids', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'coucou'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key2',
        locale: 'fr',
        value: 'coucou'
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.search({
        entity: 'entity',
        fields: ['key', 'key2'],
        search: 'coucou'
      });

      // then
      expect(entityIds).to.deep.equal(['entityId1']);
    });

    it('should return entity ids sorted alphabetically', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key',
        locale: 'fr',
        value: 'coucou'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'coucou'
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.search({
        entity: 'entity',
        fields: ['key'],
        search: 'coucou'
      });

      // then
      expect(entityIds).to.deep.equal(['entityId1', 'entityId2']);
    });

    it('should return a limited number of ids', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'coucou'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key',
        locale: 'fr',
        value: 'coucou'
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.search({
        entity: 'entity',
        fields: ['key'],
        search: 'coucou',
        limit: 1,
      });

      // then
      expect(entityIds).to.deep.equal(['entityId1']);
    });

    it('should perform a case-insensitive search', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'Coucou'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key',
        locale: 'fr',
        value: 'coucou'
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.search({
        entity: 'entity',
        fields: ['key'],
        search: 'coucou',
        limit: 2,
      });

      // then
      expect(entityIds).to.deep.equal(['entityId1', 'entityId2']);
    });

    describe('when search string contains wildcard characters', () => {

      beforeEach(async () => {
        databaseBuilder.factory.buildTranslation({
          key: 'entity.entityId1.key',
          locale: 'fr',
          value: 'aaa N_n aaa',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'entity.entityId2.key',
          locale: 'fr',
          value: 'On est sur de nous à 80% à peu près',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'entity.entityId3.key',
          locale: 'fr',
          value: 'aaa Non aaa',
        });
        await databaseBuilder.commit();
      });

      it('should escape % character', async () => {
        // given
        const searchString = '%';

        // when
        const entityIds = await translationRepository.search({
          entity: 'entity',
          fields: ['key'],
          search: searchString,
        });

        // then
        expect(entityIds).to.deep.equal(['entityId2']);
      });

      it('should escape _ character', async () => {
        // given
        const searchString = 'N_n';

        // when
        const entityIds = await translationRepository.search({
          entity: 'entity',
          fields: ['key'],
          search: searchString,
        });

        // then
        expect(entityIds).to.deep.equal(['entityId1']);
      });
    });
  });

  context('#listByModel', () => {
    it('should list translations matching first portion of key', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field1',
        locale:  'fr',
        value: 'aaa',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field2',
        locale:  'fr',
        value: 'bbb',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale:  'fr',
        value: 'ccc',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale:  'en',
        value: 'ddd',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity2.id1.field1',
        locale:  'fr',
        value: 'eee',
      });
      await databaseBuilder.commit();

      // when
      const translations1 = await translationRepository.listByModel('entity1');
      const translations2 = await translationRepository.listByModel('entity2');

      // then
      expect(translations1).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity1.id1.field1',
          locale:  'fr',
          value: 'aaa',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id1.field2',
          locale:  'fr',
          value: 'bbb',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale:  'fr',
          value: 'ccc',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale:  'en',
          value: 'ddd',
        }),
      ]);
      expect(translations2).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity2.id1.field1',
          locale:  'fr',
          value: 'eee',
        }),
      ]);
    });
  });

  context('#listByEntity', () => {
    it('should list translations matching first and second portion of key', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field1',
        locale:  'fr',
        value: 'aaa',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field2',
        locale:  'fr',
        value: 'bbb',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale:  'fr',
        value: 'ccc',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale:  'en',
        value: 'ddd',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity2.id1.field1',
        locale:  'fr',
        value: 'eee',
      });
      await databaseBuilder.commit();

      // when
      const translations1 = await translationRepository.listByEntity('entity1', 'id1');
      const translations2 = await translationRepository.listByEntity('entity1', 'id2');
      const translations3 = await translationRepository.listByEntity('entity2', 'id1');

      // then
      expect(translations1).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity1.id1.field1',
          locale:  'fr',
          value: 'aaa',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id1.field2',
          locale:  'fr',
          value: 'bbb',
        }),
      ]);
      expect(translations2).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale:  'fr',
          value: 'ccc',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale:  'en',
          value: 'ddd',
        }),
      ]);
      expect(translations3).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity2.id1.field1',
          locale:  'fr',
          value: 'eee',
        }),
      ]);
    });
  });

  context('#listByEntities', () => {
    it('should list translations matching first and second portion of key', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field1',
        locale:  'fr',
        value: 'aaa',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field2',
        locale:  'fr',
        value: 'bbb',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale:  'fr',
        value: 'ccc',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale:  'en',
        value: 'ddd',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id3.field1',
        locale:  'fr',
        value: 'eee',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id3.field2',
        locale:  'fr',
        value: 'fff',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity2.id1.field1',
        locale:  'fr',
        value: 'ggg',
      });
      await databaseBuilder.commit();

      // when
      const translations = await translationRepository.listByEntities('entity1', ['id2', 'id3']);

      // then
      expect(translations).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale:  'fr',
          value: 'ccc',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale:  'en',
          value: 'ddd',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id3.field1',
          locale:  'fr',
          value: 'eee',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id3.field2',
          locale:  'fr',
          value: 'fff',
        }),
      ]);
    });
  });
});

async function _setDoesTableExistInAirtable(value) {
  if (value) {
    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/translations')
      .query({
        fields: {
          '': [
            'key',
            'locale',
            'value',
          ],
        },
        sort: [{ field: 'key_locale', direction: 'asc' }],
        maxRecords: 1,
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: [] });
  } else {
    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/translations')
      .query({
        fields: {
          '': [
            'key',
            'locale',
            'value',
          ],
        },
        sort: [{ field: 'key_locale', direction: 'asc' }],
        maxRecords: 1,
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(404);
  }

  await translationRepository.checkIfTableExistInAirtable();
}
