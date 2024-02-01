import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { databaseBuilder, knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';
import {
  fillLocalizedChallengesAttachments
} from '../../scripts/fill-localized-challenges-attachments/index.js';

describe('Fill localized challenges attachments from airtable', function() {

  let airtableClient;

  beforeEach(() => {
    airtableClient = new Airtable({
      apiKey: 'airtableApiKeyValue',
    }).base('airtableBaseValue');
  });

  afterEach(async () => {
    await knex('localized_challenges-attachments').delete();
  });

  it('fills localized_challenges-attachments table from airtable', async function() {
    // given
    databaseBuilder.factory.buildLocalizedChallenge({ id: 'localizedChallenge1' });
    await databaseBuilder.commit();
    const attachment1 = {
      fields: {
        'Record ID': 'attachment1',
        localizedChallengeId: 'localizedChallenge1',
      }
    };

    const attachments = [attachment1];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Attachments')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query({
        fields: {
          '': [
            'Record ID',
            'localizedChallengeId',
          ]
        }
      })
      .reply(200, { records: attachments });

    // when
    await fillLocalizedChallengesAttachments({ airtableClient });

    // then
    const localizedChallengesAttachments = await knex('localized_challenges-attachments').select().orderBy('attachmentId');

    expect(localizedChallengesAttachments).to.have.lengthOf(1);
    expect(localizedChallengesAttachments).to.deep.equal([
      {
        attachmentId: 'attachment1',
        localizedChallengeId: 'localizedChallenge1',
      },
    ]);
  });
});
