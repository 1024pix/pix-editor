import { describe, expect, it, vi } from 'vitest';
import * as airtableProxy from '../../../lib/application/airtable-proxy.js';

describe('Unit | Application | airtable proxy', function() {
  describe('#getTableTranslation', function() {
    const tableName = 'Entites';

    describe('when table translations implements extractFromProxyObject', () => {
      it('should enable Write to Pg', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            extractFromProxyObject: vi.fn(),
          },
        };

        // When
        const tableTranslations = airtableProxy.getTableTranslations(tablesTranslations, tableName);

        // Then
        expect(tableTranslations.writeToPgEnabled).toBe(true);
        expect(tableTranslations.readFromPgEnabled).toBe(false);
        expect(tableTranslations.writeToAirtableDisabled).toBe(false);
      });
    });

    describe('when table translations implements extractFromProxyObject and hydrateProxyObject', () => {
      it('should enable Read to Pg', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            extractFromProxyObject: vi.fn(),
            hydrateProxyObject: vi.fn(),
          },
        };

        // When
        const tableTranslations = airtableProxy.getTableTranslations(tablesTranslations, tableName);

        // Then
        expect(tableTranslations.writeToPgEnabled).toBe(true);
        expect(tableTranslations.readFromPgEnabled).toBe(true);
        expect(tableTranslations.writeToAirtableDisabled).toBe(false);
      });
    });

    describe('when table translations implements extractFromProxyObject, hydrateProxyObject and proxyObjectToAirtableObject', () => {
      it('shoud enable Write to Airtable', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            extractFromProxyObject: vi.fn(),
            hydrateProxyObject: vi.fn(),
            proxyObjectToAirtableObject: vi.fn(),
          },
        };

        // When
        const tableTranslations = airtableProxy.getTableTranslations(tablesTranslations, tableName);

        // Then
        expect(tableTranslations.writeToPgEnabled).toBe(true);
        expect(tableTranslations.readFromPgEnabled).toBe(true);
        expect(tableTranslations.writeToAirtableDisabled).toBe(true);
      });
    });

    describe('when table translations implements only hydrateProxyObject', () => {
      it('should not enable Read to Pg', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            hydrateProxyObject: vi.fn(),
          },
        };

        // When
        const tableTranslations = airtableProxy.getTableTranslations(tablesTranslations, tableName);

        // Then
        expect(tableTranslations.writeToPgEnabled).toBe(false);
        expect(tableTranslations.readFromPgEnabled).toBe(false);
        expect(tableTranslations.writeToAirtableDisabled).toBe(false);
      });
    });

    describe('when table translations implements only hydrateProxyObject and proxyObjectToAirtableObject', () => {
      it('should not enable Read to Pg or disable write to Airtable', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            hydrateProxyObject: vi.fn(),
            proxyObjectToAirtableObject: vi.fn(),
          },
        };

        // When
        const tableTranslations = airtableProxy.getTableTranslations(tablesTranslations, tableName);

        // Then
        expect(tableTranslations.writeToPgEnabled).toBe(false);
        expect(tableTranslations.readFromPgEnabled).toBe(false);
        expect(tableTranslations.writeToAirtableDisabled).toBe(false);
      });
    });

    describe('when table translations implements only extractFromProxyObject and proxyObjectToAirtableObject', () => {
      it('should enable only write to PG', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            extractFromProxyObject: vi.fn(),
            proxyObjectToAirtableObject: vi.fn(),
          },
        };

        // When
        const tableTranslations = airtableProxy.getTableTranslations(tablesTranslations, tableName);

        // Then
        expect(tableTranslations.writeToPgEnabled).toBe(true);
        expect(tableTranslations.readFromPgEnabled).toBe(false);
        expect(tableTranslations.writeToAirtableDisabled).toBe(false);
      });
    });
  });
});

