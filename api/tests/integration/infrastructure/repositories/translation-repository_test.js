import { afterEach, beforeEach, describe, describe as context, expect, it } from 'vitest';
import { knex, databaseBuilder, streamToPromiseArray } from '../../../test-helper.js';
import { checkIfShouldDuplicateToAirtable, save } from '../../../../lib/infrastructure/repositories/translation-repository.js';
import nock from 'nock';
import { translationRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { Translation } from '../../../../lib/domain/models/Translation';

describe('Integration | Repository | translation-repository', function() {

  beforeEach(async function() {
    await _setShouldDuplicateToAirtable(true);
  });

  afterEach(async function() {
    await knex('translations').delete();
    await _setShouldDuplicateToAirtable(false);
  });

  context('#save', function() {

    it('should save translations to airtable when Airtable has a translations table', async function() {
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
  });

  context('#streamList', function() {
    it('should stream a list', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'some.key',
        locale: 'fr',
        value: 'Bonjour, la mif'
      });
      await databaseBuilder.commit();

      // when
      const stream = translationRepository.streamList();
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
