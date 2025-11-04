import { beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyAreasFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-areas-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, knex } from '../../../test-helper.js';

const TABLE_NAME = 'areas';
const AIRTABLE_NAME = 'Domaines';

describe('Integration | Scripts | CopyAreasFromAirtableToPg', () => {
  /** @type {CopyAreasFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyAreasFromAirtableToPg();
  });

  describe('#handle', () => {
    it('reads areas from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123Abc', {
          fields: {
            'id persistant': 'area123Abc',
            Code: '1',
            Couleur: 'Black',
            Referentiel: ['recFmk123'],
          },
          createdTime: '2025-09-02T00:00:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456Def', {
          fields: {
            'id persistant': 'area456Def',
            Code: '2',
            Couleur: 'Pink',
            Referentiel: ['recFmk123'],
          },
          createdTime: '2025-09-02T13:58:00Z',
        }),
      ]);

      databaseBuilder.factory.buildFramework({
        id: 'recFmk123',
        name: 'Un référentiel',
      });
      databaseBuilder.factory.buildArea({
        id: 'area123Abc',
        code: '1',
        color: null,
        frameworkId: 'recFmk123',
        createdAt: '2025-09-02T00:00:00Z',
        updatedAt: '2025-09-02T10:00:00Z',
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: ['id persistant', 'Code', 'Couleur', 'Referentiel'],
      });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'area123Abc',
          code: '1',
          color: 'Black',
          frameworkId: 'recFmk123',
          createdAt: new Date('2025-09-02T00:00:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'area456Def',
          code: '2',
          color: 'Pink',
          frameworkId: 'recFmk123',
          createdAt: new Date('2025-09-02T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads areas from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123Abc', {
            fields: {
              'id persistant': 'area123Abc',
              Code: '1',
              Couleur: 'Black',
              Referentiel: ['recFmk123'],
            },
            createdTime: '2025-09-02T00:00:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456Def', {
            fields: {
              'id persistant': 'area456Def',
              Code: '2',
              Couleur: 'Pink',
              Referentiel: ['recFmk123'],
            },
            createdTime: '2025-09-02T13:58:00Z',
          }),
        ]);

        databaseBuilder.factory.buildFramework({
          id: 'recFmk123',
          name: 'Un référentiel',
        });
        databaseBuilder.factory.buildArea({
          id: 'area123Abc',
          code: '1',
          color: null,
          frameworkId: 'recFmk123',
          createdAt: '2025-09-02T00:00:00Z',
          updatedAt: '2025-09-02T10:00:00Z',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
          fields: ['id persistant', 'Code', 'Couleur', 'Referentiel'],
        });

        await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
          {
            id: 'area123Abc',
            code: '1',
            color: null,
            frameworkId: 'recFmk123',
            createdAt: new Date('2025-09-02T00:00:00Z'),
            updatedAt: new Date('2025-09-02T10:00:00Z'),
          },
        ]);
      });
    });
  });
});
