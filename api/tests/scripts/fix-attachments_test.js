import { describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, knex } from '../test-helper.js';
import nock from 'nock';

import { fixAttachments } from '../../scripts/fix-attachments/index.js';

describe('Script | Fix attachments', function() {

  it('Delete entries in localized_challenges-attachments that dont exists on airtable', async function() {
    // given
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challenge1',
      challengeId: 'challenge1',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challenge2',
      challengeId: 'challenge2',
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge1',
      attachmentId: 'attachment1'
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge2',
      attachmentId: 'attachment2'
    });
    await databaseBuilder.commit();

    const attachments = [
      airtableBuilder.factory.buildAttachment({
        id: 'attachment1',
        challengeId: 'challenge1'
      })
    ];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Attachments')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: attachments });

    // when
    await fixAttachments({ dryRun: false });

    // then
    await expect(
      knex('localized_challenges-attachments').select(),
    ).resolves.toEqual([
      {
        attachmentId: 'attachment1',
        localizedChallengeId: 'challenge1'
      }
    ]);
  });

  it('Delete duplicate illustrations', async function() {
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challenge1',
      challengeId: 'challenge1',
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge1',
      attachmentId: 'attachment1'
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge1',
      attachmentId: 'attachment2'
    });

    await databaseBuilder.commit();

    const attachments = [
      airtableBuilder.factory.buildAttachment({
        id: 'attachment1',
        challengeId: 'challenge1',
        type: 'illustration',
        createdAt: '2024-02-19T15:29:38.123Z',
      }),
      airtableBuilder.factory.buildAttachment({
        id: 'attachment2',
        challengeId: 'challenge1',
        type: 'illustration',
        createdAt: '2024-02-19T14:29:38.123Z',
      })
    ];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Attachments')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: attachments });

    nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/Attachments')
      .query({
        records: {
          '': 'attachment2'
        }
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, {
        records: []
      });

    // when
    await fixAttachments({ dryRun: false });

    // then
    expect(nock.isDone()).to.be.true;
    await expect(
      knex('localized_challenges-attachments').select(),
    ).resolves.toEqual([
      {
        attachmentId: 'attachment1',
        localizedChallengeId: 'challenge1'
      }
    ]);
  });

  it('Delete attachments with duplicate extensions', async function() {
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challenge1',
      challengeId: 'challenge1',
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge1',
      attachmentId: 'attachment1'
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge1',
      attachmentId: 'attachment2'
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge1',
      attachmentId: 'attachment3'
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge1',
      attachmentId: 'attachment4'
    });
    databaseBuilder.factory.buildLocalizedChallengeAttachment({
      localizedChallengeId: 'challenge1',
      attachmentId: 'attachment5'
    });

    await databaseBuilder.commit();

    const attachments = [
      airtableBuilder.factory.buildAttachment({
        id: 'attachment1',
        challengeId: 'challenge1',
        type: 'attachment',
        url: 'http://example.com/toto.odt',
        createdAt: '2024-02-19T14:29:38.123Z',
      }),
      airtableBuilder.factory.buildAttachment({
        id: 'attachment2',
        challengeId: 'challenge1',
        type: 'attachment',
        url: 'http://example.com/toto2.odt',
        createdAt: '2024-02-19T15:29:38.123Z',
      }),
      airtableBuilder.factory.buildAttachment({
        id: 'attachment3',
        challengeId: 'challenge1',
        type: 'attachment',
        url: 'http://example.com/toto.docx',
        createdAt: '2024-02-18T14:29:38.123Z',
      }),
      airtableBuilder.factory.buildAttachment({
        id: 'attachment4',
        challengeId: 'challenge1',
        type: 'attachment',
        url: 'http://example.com/toto2.docx',
        createdAt: '2024-02-18T15:29:38.123Z',
      }),
      airtableBuilder.factory.buildAttachment({
        id: 'attachment5',
        challengeId: 'challenge1',
        type: 'attachment',
        url: 'http://example.com/toto2.zip',
        createdAt: '2024-02-18T15:29:38.123Z',
      })
    ];

    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Attachments')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .reply(200, { records: attachments });

    nock('https://api.airtable.com')
      .delete('/v0/airtableBaseValue/Attachments')
      .query({
        records: {
          '': ['attachment3', 'attachment1']
        }
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, {
        records: []
      });

    // when
    await fixAttachments({ dryRun: false });

    // then
    expect(nock.isDone()).to.be.true;
    await expect(
      knex('localized_challenges-attachments').select(),
    ).resolves.toEqual([
      {
        attachmentId: 'attachment2',
        localizedChallengeId: 'challenge1'
      },
      {
        attachmentId: 'attachment4',
        localizedChallengeId: 'challenge1'
      },
      {
        attachmentId: 'attachment5',
        localizedChallengeId: 'challenge1'
      }
    ]);
  });
});
