import { afterEach, beforeEach, describe, describe as context, expect, it } from 'vitest';
import { knex, databaseBuilder } from '../../../test-helper.js';
import {
  checkIfShouldDuplicateToAirtable,
  save,
  search,
} from '../../../../lib/infrastructure/repositories/translation-repository.js';
import nock from 'nock';
import { translationRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Integration | Repository | translation-repository', function() {

  afterEach(async function() {
    await knex('translations').delete();
  });

  context('#save', function() {

    context('when Airtable has a translations table', () => {
      beforeEach(async function() {
        await _setShouldDuplicateToAirtable(true);
      });

      afterEach(async function() {
        await _setShouldDuplicateToAirtable(false);
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
        await save([{ key: 'entity.recordid.key', locale: 'fr', value: 'translationValue' }]);

        // then
        expect(nock.isDone()).to.be.true;
      });

      afterEach(async function() {
        await _setShouldDuplicateToAirtable(false);
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
      await translationRepository.deleteByKeyPrefixAndLocales(prefixToDelete, locales);

      // then
      expect(await knex('translations').select()).to.deep.equal([
        {
          key: 'some.prefix.key',
          locale: 'nl-be',
          value: 'Hallo, het mif'
        },
      ]);
    });

    context('when Airtable has a translations table', () => {
      beforeEach(async function() {
        await _setShouldDuplicateToAirtable(true);
      });

      afterEach(async function() {
        await _setShouldDuplicateToAirtable(false);
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
        await translationRepository.deleteByKeyPrefixAndLocales(prefixToDelete, locales);

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
      const entityIds = await search({
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
      const entityIds = await search({
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
      const entityIds = await search({
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
      const entityIds = await search({
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
      const entityIds = await search({
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
        const entityIds = await search({
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
        const entityIds = await search({
          entity: 'entity',
          fields: ['key'],
          search: searchString,
        });

        // then
        expect(entityIds).to.deep.equal(['entityId1']);
      });
    });
  });
});

async function _setShouldDuplicateToAirtable(value) {
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

  await checkIfShouldDuplicateToAirtable();
}
