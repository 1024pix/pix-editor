import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyFrameworksFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-frameworks-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, knex } from '../../../test-helper.js';

const TABLE_NAME = 'frameworks';
const AIRTABLE_NAME = 'Referentiel';

describe('Integration | Scripts | CopyFrameworksFromAirtableToPg', () => {
  /** @type {CopyFrameworksFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyFrameworksFromAirtableToPg();
  });

  describe('#handle', () => {
    afterEach(async () => {
      await knex.delete().from(TABLE_NAME);
    });

    it('reads frameworks from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123Abc', {
          fields: {
            Nom: 'Pix',
          },
          createdTime: '2025-09-02T04:30:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456Def', {
          fields: {
            Nom: 'Nouveau',
          },
          createdTime: '2025-09-02T13:58:00Z',
        }),
      ]);

      databaseBuilder.factory.buildFramework({
        id: 'rec123Abc',
        name: 'Oux',
        createdAt: '2025-09-02T00:00:00Z',
        updatedAt: '2025-09-02T10:00:00Z',
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: ['Nom'] });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'rec123Abc',
          name: 'Pix',
          createdAt: new Date('2025-09-02T04:30:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'rec456Def',
          name: 'Nouveau',
          createdAt: new Date('2025-09-02T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads frameworks from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123Abc', {
            fields: {
              Nom: 'Pix',
            },
            createdTime: '2025-09-02T04:30:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456Def', {
            fields: {
              Nom: 'Nouveau',
            },
            createdTime: '2025-09-02T13:58:00Z',
          }),
        ]);

        databaseBuilder.factory.buildFramework({
          id: 'rec123Abc',
          name: 'Oux',
          createdAt: '2025-09-02T00:00:00Z',
          updatedAt: '2025-09-02T10:00:00Z',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: ['Nom'] });

        await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
          {
            id: 'rec123Abc',
            name: 'Oux',
            createdAt: new Date('2025-09-02T00:00:00Z'),
            updatedAt: new Date('2025-09-02T10:00:00Z'),
          },
        ]);
      });
    });
  });
});
