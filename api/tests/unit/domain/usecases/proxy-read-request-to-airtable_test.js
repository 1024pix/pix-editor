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
    const airtableFields = Symbol('airtableFields');

    beforeEach(() => {
      response = { status: 200, data: { fields: airtableFields } };
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
      const proxyResponseFields = Symbol('proxyResponseFields');

      beforeEach(() => {
        tableTranslations.readFromPgEnabled = true;
        tableTranslations.prefixFor.mockReturnValue('entity.id.');
        translationRepository.listByPrefix.mockResolvedValue(translations);
        tableTranslations.airtableObjectToProxyObject.mockReturnValue(proxyResponseFields);
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
        expect(response.data.fields).toBe(proxyResponseFields);

        expect(tableTranslations.prefixFor).toHaveBeenCalledOnce();
        expect(tableTranslations.prefixFor).toHaveBeenCalledWith(airtableFields);

        expect(translationRepository.listByPrefix).toHaveBeenCalledOnce();
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith('entity.id.');

        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledOnce();
        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledWith(airtableFields, translations);
      });
    });
  });

  describe('when reading several entities', () => {
    const airtableFields1 = Symbol('airtableFields1');
    const airtableFields2 = Symbol('airtableFields2');

    beforeEach(() => {
      response = { status: 200, data: { records: [{ fields: airtableFields1 }, { fields: airtableFields2 }] } };
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
      const proxyResponseFields1 = Symbol('proxyResponseFields1');
      const proxyResponseFields2 = Symbol('proxyResponseFields2');

      beforeEach(() => {
        tableTranslations.readFromPgEnabled = true;
        translationRepository.listByPrefix.mockResolvedValue(translations);
        tableTranslations.airtableObjectToProxyObject.mockReturnValueOnce(proxyResponseFields1);
        tableTranslations.airtableObjectToProxyObject.mockReturnValueOnce(proxyResponseFields2);
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
        expect(actualResponse.data.records[0].fields).toBe(proxyResponseFields1);
        expect(actualResponse.data.records[1].fields).toBe(proxyResponseFields2);

        expect(translationRepository.listByPrefix).toHaveBeenCalledOnce();
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith(tableTranslations.prefix);

        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenCalledTimes(2);
        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenNthCalledWith(1, airtableFields1, translations);
        expect(tableTranslations.airtableObjectToProxyObject).toHaveBeenNthCalledWith(2, airtableFields2, translations);
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
