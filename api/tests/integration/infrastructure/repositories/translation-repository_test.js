const { expect, knex } = require('../../../test-helper');
const translationRepository = require('../../../../lib/infrastructure/repositories/translation-repository');
const config = require('../../../../lib/config');
const nock = require('nock');

describe('Integration | Repository | translation-repository', function() {

  afterEach(async function() {
    await knex('translations').delete();
    config.airtable.saveTranslations = false;
  });

  context('#save', function() {

    it('should save translations to airtable when AIRTABLE_SAVE_TRANSLATIONS is true', async function() {
      // given
      config.airtable.saveTranslations = true;

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
      await translationRepository.save([{ key: 'entity.recordid.key', locale: 'fr', value: 'translationValue' }]);

      // then
      expect(nock.isDone()).to.be.true;
    });
  });
});

