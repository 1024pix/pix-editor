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
      hydrateToAirtableObject: vi.fn(),
      readFromPgEnabled: false,
    };
    translationRepository = {
      listByPrefix: vi.fn(),
    };
  });

  describe('when reading a single entity', () => {
    const entity = Symbol('entity');

    beforeEach(() => {
      response = { status: 200, data: { fields: entity } };
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
      beforeEach(() => {
        tableTranslations.readFromPgEnabled = true;
        tableTranslations.prefixFor.mockReturnValue('entity.id.');
        translationRepository.listByPrefix.mockResolvedValue(translations);
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

        expect(tableTranslations.prefixFor).toHaveBeenCalledOnce();
        expect(tableTranslations.prefixFor).toHaveBeenCalledWith(entity);

        expect(translationRepository.listByPrefix).toHaveBeenCalledOnce();
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith('entity.id.');

        expect(tableTranslations.hydrateToAirtableObject).toHaveBeenCalledOnce();
        expect(tableTranslations.hydrateToAirtableObject).toHaveBeenCalledWith(entity, translations);
      });
    });
  });

  describe('when reading several entities', () => {
    const entity1 = Symbol('entity1');
    const entity2 = Symbol('entity2');

    beforeEach(() => {
      response = { status: 200, data: { records: [{ fields: entity1 }, { fields: entity2 }] } };
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
      beforeEach(() => {
        tableTranslations.readFromPgEnabled = true;
        translationRepository.listByPrefix.mockResolvedValue(translations);
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

        expect(translationRepository.listByPrefix).toHaveBeenCalledOnce();
        expect(translationRepository.listByPrefix).toHaveBeenCalledWith(tableTranslations.prefix);

        expect(tableTranslations.hydrateToAirtableObject).toHaveBeenCalledTimes(2);
        expect(tableTranslations.hydrateToAirtableObject).toHaveBeenNthCalledWith(1, entity1, translations);
        expect(tableTranslations.hydrateToAirtableObject).toHaveBeenNthCalledWith(2, entity2, translations);
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
