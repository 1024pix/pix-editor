import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { databaseBuilder, knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';
import {
  migrateAttachmentsTranslationFromAirtable
} from '../../scripts/migrate-attachments-translation-from-airtable/index.js';

describe('Migrate translation from airtable', function() {

  let airtableClient;

  beforeEach(async () => {
    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .optionally()
      .reply(404);

    airtableClient = new Airtable({
      apiKey: 'airtableApiKeyValue',
    }).base('airtableBaseValue');

    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'localizedChallengeId',
      challengeId: 'monChallengeId',
      locale: 'fr'
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'localizedChallengeId',
      attachmentId: 'airtableAttachmentId'
    });
    await databaseBuilder.commit();
  });

  afterEach(async () => {
    await knex('translations').truncate();
  });

  it('fills translations table', async function() {
    // given
    const attachment = {
      id: 'airtableAttachmentId',
      fields: {
        alt: 'Mon alt',
        localizedChallengeId: 'localizedChallengeId',
      }
    };

    const attachments = [attachment];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Attachments')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: attachments });

    // when
    await migrateAttachmentsTranslationFromAirtable({ airtableClient });

    // then
    const translations = await knex('translations').select().orderBy([{
      column: 'key',
      order: 'asc'
    }, { column: 'locale', order: 'asc' }]);

    expect(translations).to.deep.equal([
      {
        key: 'challenge.monChallengeId.illustrationAlt',
        locale: 'fr',
        value: 'Mon alt'
      },
    ]);
  });
});
