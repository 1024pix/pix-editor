import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proxyWriteRequestToAirtable } from '../../../../lib/domain/usecases/proxy-write-request-to-airtable.js';

describe('Unit | Domain | Usecases | proxy-write-request-to-airtable', () => {
  let proxyRequestToAirtable;
  let tableTranslations;
  let translationRepository;
  let updateStagingPixApiCache;
  let responseEntity;
  let response;
  let request;

  const requestFields = Symbol('requestFields');
  const airtableBase = Symbol('airtableBase');
  const tableName = Symbol('tableName');
  const translations = Symbol('translations');
  const responseFields = Symbol('responseFields');

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
    request = { payload: { fields: requestFields } };
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
      request = { payload: { fields: requestFields } };
      responseEntity = { fields: responseFields };
      response = { status: 200, data: responseEntity };

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
      expect(updateStagingPixApiCache).toHaveBeenCalledWith(tableName, responseEntity, undefined);
    });

    describe('when writing translations to PG is enabled', () => {
      beforeEach(() => {
        request = { method: 'post', payload: { fields: requestFields } };

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
        expect(tableTranslations.extractFromProxyObject).toHaveBeenCalledWith(requestFields);

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
          expect(tableTranslations.extractFromProxyObject).toHaveBeenCalledWith(requestFields);

          expect(tableTranslations.prefixFor).toHaveBeenCalledOnce();
          expect(tableTranslations.prefixFor).toHaveBeenCalledWith(responseFields);

          expect(translationRepository.deleteByKeyPrefixAndLocales).toHaveBeenCalledOnce();
          expect(translationRepository.deleteByKeyPrefixAndLocales).toHaveBeenCalledWith({ prefix:'entity.id', locales: ['fr', 'fr-fr', 'en'] });

          expect(translationRepository.save).toHaveBeenCalledOnce();
          expect(translationRepository.save).toHaveBeenCalledWith({ translations });
        });
      });

      describe('when reading translations from PG is enabled', () => {
        const proxyResponseFields = Symbol('proxyResponseFields');

        beforeEach(() => {
          tableTranslations.readFromPgEnabled = true;
          tableTranslations.airtableObjectToProxyObject.mockReturnValue(proxyResponseFields);
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
          expect(response.data.fields).toBe(proxyResponseFields);

          expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledOnce();
          expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledWith(responseFields, translations);

          expect(updateStagingPixApiCache).toHaveBeenCalledOnce();
          expect(updateStagingPixApiCache).toHaveBeenCalledWith(tableName, responseEntity, translations);
        });

        describe('when writing translations to Airtable is disabled', () => {
          const airtableRequestFields = Symbol('airtableRequestFields');

          beforeEach(() => {
            tableTranslations.writeToAirtableDisabled = true;
            tableTranslations.proxyObjectToAirtableObject.mockReturnValue(airtableRequestFields);
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

            expect(request.payload.fields).toBe(airtableRequestFields);

            expect(tableTranslations.proxyObjectToAirtableObject).toHaveBeenCalledOnce();
            expect(tableTranslations.proxyObjectToAirtableObject).toHaveBeenCalledWith(requestFields);
          });
        });
      });
    });
  });

  describe('when response is not OK', () => {
    beforeEach(() => {
      request = { payload: { fields: requestFields } };
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
