import { beforeEach, describe, expect, it } from 'vitest';
import Airtable from 'airtable';
import nock from 'nock';
import { databaseBuilder } from '../test-helper.js';
import { fillMissingAttachmentsChallengeIds } from '../../scripts/fill-missing-attachments-challenge-ids/index.js';

describe('Fill missing attachments challenge Ids in airtable', function() {
  let airtableClient;

  beforeEach(() => {
    airtableClient = new Airtable({
      apiKey: 'airtableApiKeyValue',
    }).base('airtableBaseValue');
  });

  it('should retrieve attachments without challenge id', async () => {
    // given
    databaseBuilder.factory.buildLocalizedChallenge({
      challengeId: 'challengeId',
      id: 'localizedChallengeId',
    });
    await databaseBuilder.commit();

    const airtableAttachment = {
      id: 'attachmentId',
      fields: {
        'Record ID': 'attachmentId',
        localizedChallengeId: 'localizedChallengeId',
      }
    };
    const airtableChallenge = {
      id: 'airtableChallengeId',
      fields: {
        'id persistant': 'challengeId',
      },
    };
    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Attachments')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query({
        fields: {
          '': [
            'Record ID',
            'localizedChallengeId',
          ]
        },
        filterByFormula: '{challengeId} = BLANK()'
      })
      .reply(200, { records: [airtableAttachment] });

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Epreuves')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query({
        fields: {
          '': 'id persistant',
        },
        filterByFormula: 'OR({id persistant} = "challengeId")',
      })
      .reply(200, { records: [airtableChallenge] });

    const attachmentRecord = { id: 'attachmentId', fields: { challengeId: ['airtableChallengeId'] } };
    nock('https://api.airtable.com')
      .patch('/v0/airtableBaseValue/Attachments/?', { records: [attachmentRecord] })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: [attachmentRecord] });

    // when
    await fillMissingAttachmentsChallengeIds({ airtableClient });

    // then
    expect(nock.isDone()).to.be.true;
  });
});
