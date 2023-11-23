import { describe, expect, it, vi } from 'vitest';
import * as airtableProxy from '../../../lib/application/airtable-proxy.js';

describe('Unit | Application | airtable proxy', function() {
  describe('#getTableTranslation', function() {
    const tableName = 'Entites';

    describe('when table translations implements extractFromAirtableObject', () => {
      it('should enable Write to Pg', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            extractFromAirtableObject: vi.fn(),
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

    describe('when table translations implements extractFromAirtableObject and hydrateToAirtableObject', () => {
      it('should enable Read to Pg', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            extractFromAirtableObject: vi.fn(),
            hydrateToAirtableObject: vi.fn(),
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

    describe('when table translations implements extractFromAirtableObject, hydrateToAirtableObject and dehydrateAirtableObject', () => {
      it('shoud enable Write to Airtable', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            extractFromAirtableObject: vi.fn(),
            hydrateToAirtableObject: vi.fn(),
            dehydrateAirtableObject: vi.fn(),
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

    describe('when table translations implements only hydrateToAirtableObject', () => {
      it('should not enable Read to Pg', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            hydrateToAirtableObject: vi.fn(),
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

    describe('when table translations implements only hydrateToAirtableObject and dehydrateAirtableObject', () => {
      it('should not enable Read to Pg or disable write to Airtable', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            hydrateToAirtableObject: vi.fn(),
            dehydrateAirtableObject: vi.fn(),
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

    describe('when table translations implements only extractFromAirtableObject and dehydrateAirtableObject', () => {
      it('should enable only write to PG', async function() {
        // Given
        const tablesTranslations = {
          [tableName]: {
            extractFromAirtableObject: vi.fn(),
            dehydrateAirtableObject: vi.fn(),
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

