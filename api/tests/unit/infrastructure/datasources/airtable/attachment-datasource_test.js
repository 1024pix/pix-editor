import { expect, airtableBuilder, sinon } from '../../../../test-helper.js';
import { attachmentDatasource } from '../../../../../lib/infrastructure/datasources/airtable/attachment-datasource.js';
import * as airtable from '../../../../../lib/infrastructure/airtable.js';
import airtableClient from 'airtable';

describe('Unit | Infrastructure | Datasource | Airtable | AttachmentDatasource', () => {

  describe('#filterByChallengeId', () => {
    it('calls airtable', async () => {
      const attachment = airtableBuilder.factory.buildAttachment({
        id: 'recAttachment',
        challengeId: 'recChallenge'
      });
      const attachmentRecord = new airtableClient.Record('Attachments', attachment.id, attachment);

      sinon.stub(airtable, 'findRecords')
        .withArgs('Attachments', { filterByFormula: '{challengeId persistant} = \'recChallenge\'' })
        .resolves([attachmentRecord]);

      const newAttachments = await attachmentDatasource.filterByChallengeId('recChallenge');

      expect(newAttachments[0].id).to.equal('recAttachment');
      expect(newAttachments).to.have.length(1);
    });
  });
});

