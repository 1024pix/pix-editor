const { expect, domainBuilder, sinon } = require('../../../test-helper');
const updatedRecordNotifier = require('../../../../lib/infrastructure/event-notifier/updated-record-notifier');

describe('Unit | Infrastructure | EventNotifier | UpdatedRecordedNotifier', () => {

  describe('#Notify', () => {

    it('should call the webhook when a record is updated', async () => {
      // given
      const updatedRecord = domainBuilder.buildAreaAirtableDataObject();
      const model = 'Model';
      const pixApiClient = { request: sinon.stub() };

      // when
      await updatedRecordNotifier.notify({ pixApiClient, updatedRecord, model });

      // then
      expect(pixApiClient.request).to.have.been.calledWith({ payload: updatedRecord, url: `/api/cache/${model}/${updatedRecord.id}` });
    });
  });

});
