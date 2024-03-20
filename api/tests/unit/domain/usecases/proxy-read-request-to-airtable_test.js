import { beforeEach, describe, expect, it, vi } from 'vitest';
import { proxyReadRequestToAirtable } from '../../../../lib/domain/usecases/proxy-read-request-to-airtable.js';

describe('Unit | Domain | Usecases | proxy-read-request-to-airtable', () => {
  let proxyRequestToAirtable;
  let tableTranslations;
  let translationRepository;
  let response;

  const request = Symbol('request');
  const airtableBase = Symbol('airtableBase');
  const translations = Symbol('translations');

  beforeEach(() => {
    proxyRequestToAirtable = vi.fn();
    tableTranslations = {
      prefix: 'entity.',
      prefixFor: vi.fn(),
      airtableObjectToProxyObject: vi.fn(),
      readFromPgEnabled: false,
    };
    translationRepository = {
      listByPrefix: vi.fn(),
    };
  });

  describe('when reading a single entity', () => {
    const airtableData = Symbol('airtableData');

    beforeEach(() => {
      response = { status: 200, data: airtableData };
      proxyRequestToAirtable.mockResolvedValue(response);
    });

    it('should proxy request to airtable', async () => {
      // when
      const actualResponse = await proxyReadRequestToAirtable(request, airtableBase, {
        proxyRequestToAirtable,
        tableTranslations,
      });

      // then
      expect(actualResponse).toBe(response);

      expect(proxyRequestToAirtable).toHaveBeenCalledOnce();
      expect(proxyRequestToAirtable).toHaveBeenCalledWith(request, airtableBase);
    });

    describe('when reading translations from PG is enabled', () => {
      const proxyResponseData = Symbol('proxyResponseData');

      beforeEach(() => {
        tableTranslations.readFromPgEnabled = true;
        tableTranslations.prefixFor.mockReturnValue('entity.id.');
        translationRepository.listByPrefix.mockResolvedValue(translations);
        tableTranslations.airtableObjectToProxyObject.mockReturnValue(proxyResponseData);
      });

      it('should hydrate response with translations from PG', async () => {
        // when
        const actualResponse = await proxyReadRequestToAirtable(request, airtableBase, {
          proxyRequestToAirtable,
          tableTranslations,
          translationRepository,
        });

        // then
        expect(actualResponse).toBe(response);
        expect(response.data).toBe(proxyResponseData);

        expect(tableTranslations.prefixFor).toHaveBeenCalledOnce();
        expect(tableTranslations.prefixFor).toHaveBeenCalledWith(airtableData);

        expect(translationRepository.listByPrefix).toHaveBeenCalledOnce();
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith('entity.id.');

        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledOnce();
        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledWith(airtableData, translations);
      });
    });
  });

  describe('when reading several entities', () => {
    const airtableData1 = Symbol('airtableData1');
    const airtableData2 = Symbol('airtableData2');

    beforeEach(() => {
      response = { status: 200, data: { records: [airtableData1, airtableData2] } };
      proxyRequestToAirtable.mockResolvedValue(response);
    });

    it('should proxy request to airtable', async () => {
      // when
      const actualResponse = await proxyReadRequestToAirtable(request, airtableBase, {
        proxyRequestToAirtable,
        tableTranslations,
      });

      // then
      expect(actualResponse).toBe(response);

      expect(proxyRequestToAirtable).toHaveBeenCalledOnce();
      expect(proxyRequestToAirtable).toHaveBeenCalledWith(request, airtableBase);
    });

    describe('when reading translations from PG is enabled', () => {
      const proxyResponseData1 = Symbol('proxyResponseData1');
      const proxyResponseData2 = Symbol('proxyResponseData2');

      beforeEach(() => {
        tableTranslations.readFromPgEnabled = true;
        translationRepository.listByPrefix.mockResolvedValue(translations);
        tableTranslations.airtableObjectToProxyObject.mockReturnValueOnce(proxyResponseData1);
        tableTranslations.airtableObjectToProxyObject.mockReturnValueOnce(proxyResponseData2);
      });

      it('should hydrate response with translations from PG', async () => {
        // when
        const actualResponse = await proxyReadRequestToAirtable(request, airtableBase, {
          proxyRequestToAirtable,
          tableTranslations,
          translationRepository,
        });

        // then
        expect(actualResponse).toBe(response);
        expect(actualResponse.data.records[0]).toBe(proxyResponseData1);
        expect(actualResponse.data.records[1]).toBe(proxyResponseData2);

        expect(translationRepository.listByPrefix).toHaveBeenCalledOnce();
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith(tableTranslations.prefix);

        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledTimes(2);
        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenNthCalledWith(1, airtableData1, translations);
        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenNthCalledWith(2, airtableData2, translations);
      });
    });
  });

  describe('when response is not OK', () => {
    beforeEach(() => {
      response = { status: 400 };
      proxyRequestToAirtable.mockResolvedValue(response);
    });

    it('should return response as is', async () => {
      // when
      const actualResponse = await proxyReadRequestToAirtable(request, airtableBase, {
        proxyRequestToAirtable,
      });

      // then
      expect(actualResponse).toBe(response);
    });
  });
});
