import { afterEach, beforeEach, describe, describe as context, expect, it } from 'vitest';
import { knex, databaseBuilder, streamToPromiseArray } from '../../../test-helper.js';
import {
  checkIfShouldDuplicateToAirtable,
  save
} from '../../../../lib/infrastructure/repositories/translation-repository.js';
import nock from 'nock';
import { translationRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { Translation } from '../../../../lib/domain/models/Translation';

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

  context('#streamList', function() {
    it('should stream a list of translations of given locale', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'some.key',
        locale: 'fr-fr',
        value: 'Bonjour, la mif de France'
      });
      databaseBuilder.factory.buildTranslation({
        key: 'some.key',
        locale: 'fr',
        value: 'Bonjour, la mif'
      });
      await databaseBuilder.commit();

      // when
      const stream = translationRepository.streamList({ locale: 'fr' });
      const result = await streamToPromiseArray(stream);

      // then
      expect(result).to.deep.equal([
        new Translation({
          key: 'some.key',
          locale: 'fr',
          value: 'Bonjour, la mif'
        })]);
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

      it('should delete keys in Airtable', async() => {
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
          .reply(200, { records: [
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
          ] });

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
