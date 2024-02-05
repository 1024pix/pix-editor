import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as usecases from '../../../../lib/domain/usecases/index.js';

describe('Unit | Domain | Usecases | proxy-read-request-to-airtable', () => {
  let proxyRequestToAirtable;
  let localizedChallengesAttachmentsRepository;
  let tableName;
  let request;

  const response = Symbol('response');
  const airtableBase = Symbol('airtableBase');

  beforeEach(() => {
    proxyRequestToAirtable = vi.fn();
  });

  it('should forward the request to Airtable API', async () => {
    // given
    tableName = Symbol('tableName');
    request = Symbol('request');
    proxyRequestToAirtable.mockResolvedValueOnce(response);

    // when
    const actualResponse = await usecases.proxyDeleteRequestToAirtable(request, airtableBase, tableName, { proxyRequestToAirtable });

    // then
    expect(actualResponse).toBe(response);
    expect(proxyRequestToAirtable).toHaveBeenCalledWith(request, airtableBase);
  });

  describe('when tableName is Attachments', () => {
    it('should delete relations between deleted attachments and localized challenges', async () => {
      // given
      tableName = 'Attachments';
      proxyRequestToAirtable.mockResolvedValueOnce(response);
      localizedChallengesAttachmentsRepository = {
        deleteByAttachmentId: vi.fn().mockResolvedValueOnce(),
      };
      request = {
        params: {
          path: 'Attachments/attachmentId'
        }
      };

      // when
      const actualResponse = await usecases.proxyDeleteRequestToAirtable(request, airtableBase, tableName, { proxyRequestToAirtable, localizedChallengesAttachmentsRepository });

      // then
      expect(actualResponse).toBe(response);
      expect(proxyRequestToAirtable).toHaveBeenCalledWith(request, airtableBase);
      expect(localizedChallengesAttachmentsRepository.deleteByAttachmentId).toHaveBeenCalledWith('attachmentId');
    });
  });
});
