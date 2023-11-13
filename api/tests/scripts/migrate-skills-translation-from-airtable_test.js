import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { airtableBuilder, knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';

import {
  migrateSkillsTranslationFromAirtable
} from '../../scripts/migrate-skills-translation-from-airtable/index.js';

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

  afterEach(async () => {
    await knex('translations').truncate();
  });

  it('fills translations table', async function() {
    // given
    const skill = airtableBuilder.factory.buildSkill({
      id: 'skillid1',
      hint_i18n: {
        fr: 'indice',
        en: 'clue',
      }
    });

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Acquis')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: [skill] });

    // when
    await migrateSkillsTranslationFromAirtable({ airtableClient });

    // then
    const translations = await knex('translations').select().orderBy([{
      column: 'key',
      order: 'asc'
    }, { column: 'locale', order: 'asc' }]);

    expect(translations).to.have.lengthOf(2);
    expect(translations).to.deep.equal([
      {
        key: 'skill.skillid1.hint',
        locale: 'en',
        value: 'clue'
      },
      {
        key: 'skill.skillid1.hint',
        locale: 'fr',
        value: 'indice'
      }]);
  });
});
