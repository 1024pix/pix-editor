const { expect, airtableBuilder, knex } = require('../test-helper');
const nock = require('nock');

const { main } = require('../../scripts/migrate-competences-translation-from-airtable');

describe('Migrate translation from airtable', function() {
  it('fills translations table', async function() {
    // given
    process.env.AIRTABLE_API_KEY = 'airtableApiKeyValue';
    process.env.AIRTABLE_BASE = 'airtableBaseValue';
    const competence = airtableBuilder.factory.buildCompetence({
      index: 1,
      name_i18n: {
        fr: 'Bonjour',
        en: 'Hello',
      },
      description_i18n: {
        fr: 'Description',
        en: 'Describe',
      },
    });
    const competences = [competence];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Competences')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: competences });

    // when
    await main();

    // then
    const translations = await knex('translations').select().orderBy([{
      column: 'key',
      order: 'asc'
    }, { column: 'locale', order: 'asc' }]);

    expect(translations).to.have.lengthOf(4);
    expect(translations).to.deep.equal([
      {
        key: 'competence.competenceid1.description',
        locale: 'en',
        value: 'Describe'
      },
      {
        key: 'competence.competenceid1.description',
        locale: 'fr',
        value: 'Description'
      },
      {
        key: 'competence.competenceid1.name',
        locale: 'en',
        value: 'Hello'
      },
      {
        key: 'competence.competenceid1.name',
        locale: 'fr',
        value: 'Bonjour'
      },
    ]);
  });
});
