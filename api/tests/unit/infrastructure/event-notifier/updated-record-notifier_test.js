import { describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { notify } from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';

describe('Unit | Infrastructure | EventNotifier | UpdatedRecordedNotifier', () => {

  describe('#Notify', () => {

    it('should call the webhook when a record is updated', async () => {
      // given
      const updatedRecord = domainBuilder.buildAreaDatasourceObject();
      const model = 'Model';
      const pixApiClient = {
        request: vi.fn(),
        isPixApiCachePatchingEnabled: vi.fn().mockReturnValue(true),
      };

      // when
      await notify({ pixApiClient, updatedRecord, model });

      // then
      expect(pixApiClient.request).toHaveBeenCalledWith({ payload: updatedRecord, url: `/api/cache/${model}/${updatedRecord.id}` });
    });
  });

});
