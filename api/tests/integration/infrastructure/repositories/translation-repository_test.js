import { afterEach, beforeEach, describe, describe as context, expect, it } from 'vitest';
import { knex } from '../../../test-helper.js';
import { checkIfShouldDuplicateToAirtable, save } from '../../../../lib/infrastructure/repositories/translation-repository.js';
import nock from 'nock';

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
