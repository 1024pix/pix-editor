import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proxyWriteRequestToAirtable } from '../../../../lib/domain/usecases/proxy-write-request-to-airtable.js';

describe('Unit | Domain | Usecases | proxy-write-request-to-airtable', () => {
  let proxyRequestToAirtable;
  let tableTranslations;
  let translationRepository;
  let updateStagingPixApiCache;
  let response;
  let request;

  const requestPayload = Symbol('requestPayload');
  const airtableBase = Symbol('airtableBase');
  const tableName = Symbol('tableName');
  const translations = Symbol('translations');
  const responseData = Symbol('responseData');

  beforeEach(() => {
    proxyRequestToAirtable = vi.fn();
    tableTranslations = {
      prefix: 'entity.',
      prefixFor: vi.fn(),
      extractFromProxyObject: vi.fn(),
      airtableObjectToProxyObject: vi.fn(),
      proxyObjectToAirtableObject: vi.fn(),
      writeToPgEnabled: false,
      readFromPgEnabled: false,
      writeToAirtableDisabled: false,
    };
    translationRepository = {
      deleteByKeyPrefixAndLocales: vi.fn(),
      save: vi.fn(),
    };
    updateStagingPixApiCache = vi.fn();
  });

  it('should proxy request to airtable', async () => {
    // given
    request = { payload: requestPayload };
    response = { status: 200, data: {} };

    proxyRequestToAirtable.mockResolvedValue(response);

    // when
    const actualResponse = await proxyWriteRequestToAirtable(request, airtableBase, tableName, {
      proxyRequestToAirtable,
      tableTranslations,
      updateStagingPixApiCache,
    });

    // then
    expect(actualResponse).toBe(response);

    expect(proxyRequestToAirtable).toHaveBeenCalledOnce();
    expect(proxyRequestToAirtable).toHaveBeenCalledWith(request, airtableBase);
  });

  describe('when response is OK', () => {
    beforeEach(() => {
      request = { payload: requestPayload };
      response = { status: 200, data: responseData };

      proxyRequestToAirtable.mockResolvedValue(response);
    });

    it('should update staging Pix API cache', async () => {
      // when
      const actualResponse = await proxyWriteRequestToAirtable(request, airtableBase, tableName, {
        proxyRequestToAirtable,
        tableTranslations,
        updateStagingPixApiCache,
      });

      // then
      expect(actualResponse).toBe(response);

      expect(updateStagingPixApiCache).toHaveBeenCalledOnce();
      expect(updateStagingPixApiCache).toHaveBeenCalledWith(tableName, responseData, undefined);
    });

    describe('when creating an Attachment', () =>{
      it('should write joint entry to localized_challenges-attachments', async () => {
        // when
        const createAttachmentAirtableResponse = {
          status: 200,
          data: {
            id: 'created-attachement-id',
            fields: {
              localizedChallengeId: 'localizedChallengeId',
            }
          }
        };
        const localizedChallengesAttachmentsRepository = {
          save: vi.fn(),
        };

        proxyRequestToAirtable.mockResolvedValue(createAttachmentAirtableResponse);

        const createAttachmentRequest = {
          method: 'post',
          payload: {
            fields: {
              localizedChallengeId: 'localizedChallengeId',
            },
          }
        };

        const actualResponse = await proxyWriteRequestToAirtable(createAttachmentRequest, airtableBase, 'Attachments', {
          proxyRequestToAirtable,
          tableTranslations,
          localizedChallengesAttachmentsRepository,
          updateStagingPixApiCache,
        });

        // then
        expect(actualResponse).toBe(createAttachmentAirtableResponse);
        expect(localizedChallengesAttachmentsRepository.save).toHaveBeenCalledWith({
          attachmentId: 'created-attachement-id',
          localizedChallengeId: 'localizedChallengeId',
        });
      });

      it('should NOT refresh Pix API cache', async () => {
        // when
        const createAttachmentAirtableResponse = {
          status: 200,
          data: {
            id: 'created-attachement-id',
            fields: {
              localizedChallengeId: 'localizedChallengeId',
            }
          }
        };
        const localizedChallengesAttachmentsRepository = {
          save: vi.fn(),
        };

        proxyRequestToAirtable.mockResolvedValue(createAttachmentAirtableResponse);

        const createAttachmentRequest = {
          method: 'post',
          payload: {
            fields: {
              localizedChallengeId: 'localizedChallengeId',
            },
          }
        };

        const actualResponse = await proxyWriteRequestToAirtable(createAttachmentRequest, airtableBase, 'Attachments', {
          proxyRequestToAirtable,
          tableTranslations,
          localizedChallengesAttachmentsRepository,
          updateStagingPixApiCache,
        });

        // then
        expect(actualResponse).toBe(createAttachmentAirtableResponse);
        expect(updateStagingPixApiCache).not.to.toHaveBeenCalled();
      });
    });

    describe('when updating an Attachment', () =>{
      it('should NOT refresh Pix API cache', async () => {
        // when
        const updateAttachmentAirtableResponse = {
          status: 200,
          data: {
            id: 'updated-attachement-id',
            fields: {
              localizedChallengeId: 'localizedChallengeId',
            }
          }
        };
        const localizedChallengesAttachmentsRepository = {
          save: vi.fn(),
        };

        proxyRequestToAirtable.mockResolvedValue(updateAttachmentAirtableResponse);

        const updateAttachmentRequest = {
          method: 'patch',
          payload: {
            fields: {
              localizedChallengeId: 'localizedChallengeId',
            },
          }
        };

        const actualResponse = await proxyWriteRequestToAirtable(updateAttachmentRequest, airtableBase, 'Attachments', {
          proxyRequestToAirtable,
          tableTranslations,
          localizedChallengesAttachmentsRepository,
          updateStagingPixApiCache,
        });

        // then
        expect(actualResponse).toBe(updateAttachmentAirtableResponse);
        expect(updateStagingPixApiCache).not.to.toHaveBeenCalled();
      });
    });

    describe('when writing translations to PG is enabled', () => {
      beforeEach(() => {
        request = { method: 'post', payload: requestPayload };

        tableTranslations.writeToPgEnabled = true;
        tableTranslations.extractFromProxyObject.mockReturnValue(translations);
      });

      it('should save extracted translations to PG', async () => {
        // when
        const actualResponse = await proxyWriteRequestToAirtable(request, airtableBase, tableName, {
          proxyRequestToAirtable,
          tableTranslations,
          updateStagingPixApiCache,
          translationRepository,
        });

        // then
        expect(actualResponse).toBe(response);

        expect(tableTranslations.extractFromProxyObject).toHaveBeenCalledOnce();
        expect(tableTranslations.extractFromProxyObject).toHaveBeenCalledWith(requestPayload);

        expect(translationRepository.save).toHaveBeenCalledOnce();
        expect(translationRepository.save).toHaveBeenCalledWith({ translations });
      });

      describe('when updating an existing entity', () => {
        beforeEach(() => {
          request.method = 'patch';

          tableTranslations.prefixFor.mockReturnValue('entity.id');
        });

        it('should delete translations before saving these', async () => {
          // when
          const actualResponse = await proxyWriteRequestToAirtable(request, airtableBase, tableName, {
            proxyRequestToAirtable,
            tableTranslations,
            updateStagingPixApiCache,
            translationRepository,
          });

          // then
          expect(actualResponse).toBe(response);

          expect(tableTranslations.extractFromProxyObject).toHaveBeenCalledOnce();
          expect(tableTranslations.extractFromProxyObject).toHaveBeenCalledWith(requestPayload);

          expect(tableTranslations.prefixFor).toHaveBeenCalledOnce();
          expect(tableTranslations.prefixFor).toHaveBeenCalledWith(responseData);

          expect(translationRepository.deleteByKeyPrefixAndLocales).toHaveBeenCalledOnce();
          expect(translationRepository.deleteByKeyPrefixAndLocales).toHaveBeenCalledWith({ prefix:'entity.id', locales: ['fr', 'fr-fr', 'en'] });

          expect(translationRepository.save).toHaveBeenCalledOnce();
          expect(translationRepository.save).toHaveBeenCalledWith({ translations });
        });
      });

      describe('when reading translations from PG is enabled', () => {
        const proxyResponseData = Symbol('proxyResponseData');

        beforeEach(() => {
          tableTranslations.readFromPgEnabled = true;
          tableTranslations.airtableObjectToProxyObject.mockReturnValue(proxyResponseData);
        });

        it('should hydrate response and update staging Pix API cache using translations from PG', async () => {
          // when
          const actualResponse = await proxyWriteRequestToAirtable(request, airtableBase, tableName, {
            proxyRequestToAirtable,
            tableTranslations,
            updateStagingPixApiCache,
            translationRepository,
          });

          // then
          expect(actualResponse).toBe(response);
          expect(response.data).toBe(proxyResponseData);

          expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledOnce();
          expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledWith(responseData, translations);

          expect(updateStagingPixApiCache).toHaveBeenCalledOnce();
          expect(updateStagingPixApiCache).toHaveBeenCalledWith(tableName, proxyResponseData, translations);
        });

        describe('when writing translations to Airtable is disabled', () => {
          const airtableRequestPayload = Symbol('airtableRequestPayload');

          beforeEach(() => {
            tableTranslations.writeToAirtableDisabled = true;
            tableTranslations.proxyObjectToAirtableObject.mockReturnValue(airtableRequestPayload);
          });

          it('should dehydrate request before proxying to Airtable', async () => {
            // when
            const actualResponse = await proxyWriteRequestToAirtable(request, airtableBase, tableName, {
              proxyRequestToAirtable,
              tableTranslations,
              updateStagingPixApiCache,
              translationRepository,
            });

            // then
            expect(actualResponse).toBe(response);

            expect(request.payload).toBe(airtableRequestPayload);

            expect(tableTranslations.proxyObjectToAirtableObject).toHaveBeenCalledOnce();
            expect(tableTranslations.proxyObjectToAirtableObject).toHaveBeenCalledWith(requestPayload);
          });
        });
      });
    });
  });

  describe('when response is not OK', () => {
    beforeEach(() => {
      request = { payload: requestPayload };
      response = { status: 400 };

      proxyRequestToAirtable.mockResolvedValue(response);
    });

    it('should return response as is', async () => {
      // when
      const actualResponse = await proxyWriteRequestToAirtable(request, airtableBase, tableName, {
        proxyRequestToAirtable,
        tableTranslations,
      });

      // then
      expect(actualResponse).toBe(response);
    });
  });
});
