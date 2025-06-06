import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachmentDatasource } from '../../lib/infrastructure/datasources/airtable/index.js';
import { airtableBuilder, databaseBuilder, knex } from '../test-helper.js';
import { CopyAirtableAttachmentsToPG, } from '../../scripts/copy-airtable-attachments-to-pg.js';

describe('Integration | Scripts | CopyAirtableAttachmentsToPG', function() {
  let airtableListAttachmentsScope;
  const attachmentData1 = {
    id: 'airtableAttachmentId1',
    type: 'illustration',
    url: 'https://url-1.com',
    size: 111,
    mimeType: 'mime/1',
    filename: 'filename 1',
    challengeId: 'challenge123',
    airtableChallengeId: 'airtableChallenge123',
    localizedChallengeId: 'challenge123',
  };
  const attachmentData2 = {
    id: 'airtableAttachmentId2',
    type: 'illustration',
    url: 'https://url-2.com',
    size: 222,
    mimeType: 'mime/2',
    filename: 'filename 2',
    challengeId: 'challenge123',
    airtableChallengeId: 'airtableChallenge123',
    localizedChallengeId: 'challenge123ES',
  };
  const attachmentData3 = {
    id: 'airtableAttachmentId3',
    type: 'illustration',
    url: 'https://url-3.com',
    size: 333,
    mimeType: 'mime/3',
    filename: 'filename 3',
    challengeId: 'challenge456',
    airtableChallengeId: 'airtableChallenge456',
    localizedChallengeId: 'challenge456',
  };

  beforeEach(function() {
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challenge123',
      challengeId: 'challenge123',
      locale: 'fr',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challenge123ES',
      challengeId: 'challenge123',
      locale: 'es',
    });
    databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challenge456',
      challengeId: 'challenge456',
      locale: 'fr',
    });
    const airtableAttachments = [
      airtableBuilder.factory.buildAttachment(attachmentData1),
      airtableBuilder.factory.buildAttachment(attachmentData2),
      airtableBuilder.factory.buildAttachment(attachmentData3),
    ];
    airtableListAttachmentsScope = nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Attachments')
      .query({
        fields: { '': attachmentDatasource.usedFields },
        sort: [{ field: attachmentDatasource.sortField, direction: 'asc' }]
      })
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .reply(200, { records: airtableAttachments });
    return databaseBuilder.commit();
  });

  afterEach(function() {
    return knex('attachments').truncate();
  });

  it('copies the attachments in PG the good news', async function() {
    // when
    const script = new CopyAirtableAttachmentsToPG();
    await script.handle({
      options: { dryRun: false },
      logger: { info: vi.fn() },
    });

    // then
    const attachmentsDB = await knex('attachments').select('*').orderBy('id');
    expect(attachmentsDB).toMatchObject([
      {
        ...attachmentData1,
        airtableId: attachmentData1.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      {
        ...attachmentData2,
        airtableId: attachmentData2.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      {
        ...attachmentData3,
        airtableId: attachmentData3.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    ]);
    expect(airtableListAttachmentsScope.isDone()).be.true;
  });
});
