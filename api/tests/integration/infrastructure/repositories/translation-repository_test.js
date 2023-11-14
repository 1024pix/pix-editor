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

  context('#deleteByKeyPrefix', function() {
    it('should delete translations where key starts with given string', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'some.prefix.key',
        locale: 'fr',
        value: 'Bonjour, la mif'
      });
      await databaseBuilder.commit();

      const prefixToDelete = 'some.prefix.';

      // when
      await translationRepository.deleteByKeyPrefix(prefixToDelete);

      // then
      expect(await knex('translations').count()).to.deep.equal([{ count: 0 }]);
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
            filterByFormula: 'REGEX_MATCH(key, "^some\\.prefix\\.")',
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
                  value: 'Hello, the fim',
                },
              },
            ]
          });

        nock('https://api.airtable.com')
          .delete('/v0/airtableBaseValue/translations')
          .query({
            records: {
              '': [
                'recTranslation1',
                'recTranslation2',
              ]
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

        // when
        await translationRepository.deleteByKeyPrefix(prefixToDelete);

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

  context('#listByPrefixes', function() {
    beforeEach(async function() {
      databaseBuilder.factory.buildTranslation({
        key: 'prefixa.key',
        locale: 'fr',
        value: 'prefixa'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'prefixb.key',
        locale: 'fr',
        value: 'prefixb'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'prefixc.key',
        locale: 'fr',
        value: 'prefixc'
      });
      await databaseBuilder.commit();

    });
    context('when no prefixes are specified', () => {
      it('should return empty translations', async () => {
        // when
        const translations = await translationRepository.listByPrefixes([]);

        //then
        expect(translations).toEqual([]);
      });
    });

    context('when one prefix is specified', () => {
      it('should return translations of this prefix', async () => {
        // when
        const translations = await translationRepository.listByPrefixes(['prefixa']);

        //then
        expect(translations).toEqual([{
          key: 'prefixa.key',
          locale: 'fr',
          value: 'prefixa'
        }]);
      });
    });

    context('when multiple prefixes are specified', () => {
      it('should return translations of all prefixes', async () => {
        // when
        const translations = await translationRepository.listByPrefixes(['prefixa', 'prefixc']);

        //then
        expect(translations).toEqual([{
          key: 'prefixa.key',
          locale: 'fr',
          value: 'prefixa'
        },
        {
          key: 'prefixc.key',
          locale: 'fr',
          value: 'prefixc'
        }
        ]);
      });
    });
  });
});

async function _setShouldDuplicateToAirtable(value) {
  if (value) {
    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: [] });
  } else {
    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(404);
  }

  await checkIfShouldDuplicateToAirtable();
}
