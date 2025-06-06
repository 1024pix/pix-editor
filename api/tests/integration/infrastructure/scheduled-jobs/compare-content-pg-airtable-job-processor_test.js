import nock from 'nock';
import { beforeEach, describe as context, describe, expect, it, vi } from 'vitest';
import {
  compareAttachments
} from '../../../../lib/infrastructure/scheduled-jobs/compare-content-pg-airtable-job-processor.js';
import { attachmentDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { airtableBuilder, databaseBuilder } from '../../../test-helper.js';

describe('Integration | Infrastructure | scheduled-jobs | compare-content-pg-airtable-job', function() {
  let logger;
  beforeEach(function() {
    logger = {
      info: vi.fn(),
      error: vi.fn(),
    };
  });

  describe('#compareAttachments', function() {
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

    context('when both contents are identical', async function() {
      it('logs the good news', async function() {
        // given
        databaseBuilder.factory.buildAttachment({ ...attachmentData1, airtableId: attachmentData1.id });
        databaseBuilder.factory.buildAttachment({ ...attachmentData2, airtableId: attachmentData2.id });
        databaseBuilder.factory.buildAttachment({ ...attachmentData3, airtableId: attachmentData3.id });
        await databaseBuilder.commit();

        // when
        await compareAttachments(logger);

        // then
        expect(airtableListAttachmentsScope.isDone()).be.true;
        expect(logger.info).toHaveBeenCalledWith('INFO: Nb attachments from PG :3 | Nb attachments from Airtable :3');
        expect(logger.info).toHaveBeenCalledWith('OK: Nb of attachments identical');
        expect(logger.info).toHaveBeenCalledWith('OK: Identical attachments contents from PG and Airtable');
        expect(logger.error).toHaveBeenCalledTimes(0);
      });
    });

    context('when contents are different', async function() {

      context('when there is an attachment in Airtable not in PG', function() {

        it('logs the bad news', async function() {
          // given
          databaseBuilder.factory.buildAttachment({ ...attachmentData1, airtableId: attachmentData1.id });
          databaseBuilder.factory.buildAttachment({ ...attachmentData3, airtableId: attachmentData3.id });
          await databaseBuilder.commit();

          // when
          await compareAttachments(logger);

          // then
          expect(airtableListAttachmentsScope.isDone()).be.true;
          expect(logger.info).toHaveBeenCalledWith('INFO: Nb attachments from PG :2 | Nb attachments from Airtable :3');
          expect(logger.error).toHaveBeenCalledWith('KO: Nb of attachments different');
          expect(logger.error).toHaveBeenCalledWith('KO: List of attachment IDS existing in Airtable but not in PG : airtableAttachmentId2');
        });
      });

      context('when there is an attachment in PG not in Airtable', function() {

        it('logs the bad news', async function() {
          // given
          databaseBuilder.factory.buildAttachment({ ...attachmentData1, airtableId: attachmentData1.id });
          databaseBuilder.factory.buildAttachment({ ...attachmentData2, airtableId: attachmentData2.id });
          databaseBuilder.factory.buildAttachment({ ...attachmentData3, airtableId: attachmentData3.id });
          databaseBuilder.factory.buildAttachment({ ...attachmentData3, id: 'attachmentOnlyInPg', airtableId: 'attachmentOnlyInPg' });
          await databaseBuilder.commit();

          // when
          await compareAttachments(logger);

          // then
          expect(airtableListAttachmentsScope.isDone()).be.true;
          expect(logger.info).toHaveBeenCalledWith('INFO: Nb attachments from PG :4 | Nb attachments from Airtable :3');
          expect(logger.error).toHaveBeenCalledWith('KO: Nb of attachments different');
          expect(logger.error).toHaveBeenCalledWith('KO: List of attachment IDS existing in PG but not in Airtable : attachmentOnlyInPg');
        });
      });

      context('when there is an attachment with the same ID but not the same content', function() {

        it('logs the bad news', async function() {
          // given
          databaseBuilder.factory.buildAttachment({ ...attachmentData1, airtableId: attachmentData1.id });
          databaseBuilder.factory.buildAttachment({ ...attachmentData2, airtableId: attachmentData2.id });
          databaseBuilder.factory.buildAttachment({ ...attachmentData3, airtableId: attachmentData3.id, filename: 'FILENAME DIFFERENT' });
          await databaseBuilder.commit();

          // when
          await compareAttachments(logger);

          // then
          expect(airtableListAttachmentsScope.isDone()).be.true;
          expect(logger.info).toHaveBeenCalledWith('INFO: Nb attachments from PG :3 | Nb attachments from Airtable :3');
          expect(logger.info).toHaveBeenCalledWith('OK: Nb of attachments identical');
          expect(logger.error).toHaveBeenCalledWith('KO: List of attachment IDS having different content in PG and Airtable : airtableAttachmentId3');
        });
      });
    });
  });
});
