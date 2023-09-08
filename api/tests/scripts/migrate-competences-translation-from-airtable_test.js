import { beforeEach, describe, expect, it } from 'vitest';
import { airtableBuilder, knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';

import { migrateCompetencesTranslationFromAirtable } from '../../scripts/migrate-competences-translation-from-airtable/index.js';

describe('Migrate translation from airtable', function() {

  let airtableClient;

  beforeEach(() => {
    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .optionally()
      .reply(404);

    airtableClient = new Airtable({
      apiKey: 'airtableApiKeyValue',
    }).base('airtableBaseValue');
  });

  it('fills translations table', async function() {
    // given
    const competence = airtableBuilder.factory.buildCompetence({
      index: 1,
    });
    competence.fields['Titre fr-fr'] = 'Bonjour';
    competence.fields['Description fr-fr'] = 'Description';
    competence.fields['Titre en-us'] = 'Hello';
    competence.fields['Description en-us'] = 'Describe';
    const competences = [competence];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Competences')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: competences });

    // when
    await migrateCompetencesTranslationFromAirtable({ airtableClient });

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
