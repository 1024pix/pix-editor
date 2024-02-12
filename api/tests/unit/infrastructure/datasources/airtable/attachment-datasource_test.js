import { describe, expect, it, vi } from 'vitest';
import { airtableBuilder } from '../../../../test-helper.js';
import { attachmentDatasource } from '../../../../../lib/infrastructure/datasources/airtable/attachment-datasource.js';
import * as airtable from '../../../../../lib/infrastructure/airtable.js';
import airtableClient from 'airtable';

describe('Unit | Infrastructure | Datasource | Airtable | AttachmentDatasource', () => {

  describe('#filterByLocalizedChallengeId', () => {
    it('calls airtable', async () => {
      const attachment = airtableBuilder.factory.buildAttachment({
        id: 'recAttachment',
        challengeId: 'recChallenge'
      });
      const attachmentRecord = new airtableClient.Record('Attachments', attachment.id, attachment);

      const airtableFindRecordsSpy = vi.spyOn(airtable, 'findRecords')
        .mockResolvedValue([attachmentRecord]);

      const newAttachments = await attachmentDatasource.filterByLocalizedChallengeId('recChallenge');

      expect(newAttachments[0].id).to.equal('recAttachment');
      expect(newAttachments).to.have.length(1);
      expect(airtableFindRecordsSpy).toHaveBeenCalledWith('Attachments', { filterByFormula: '{localizedChallengeId} = \'recChallenge\'' });
    });
  });
});

