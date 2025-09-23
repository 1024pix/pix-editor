import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyCompetencesFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-competences-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, knex } from '../../../test-helper.js';

const TABLE_NAME = 'competences';
const AIRTABLE_NAME = 'Competences';

describe('Integration | Scripts | CopyCompetencesFromAirtableToPg', () => {
  /** @type {CopyCompetencesFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyCompetencesFromAirtableToPg();
  });

  describe('#handle', () => {
    afterEach(async () => {
      await knex.delete().from(TABLE_NAME);
    });

    it('reads competences from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123', {
          fields: {
            'id persistant': 'competence123',
            'Sous-domaine': '1',
            'Domaine (id persistant)': ['area456'],
          },
          createdTime: '2025-09-23T00:00:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456', {
          fields: {
            'id persistant': 'competence456',
            'Sous-domaine': '2',
            'Domaine (id persistant)': ['area456'],
          },
          createdTime: '2025-09-23T13:58:00Z',
        }),
      ]);

      databaseBuilder.factory.buildFramework({
        id: 'recFmk123',
        name: 'Un référentiel',
      });
      databaseBuilder.factory.buildArea({
        id: 'area123',
        code: '1',
        frameworkId: 'recFmk123',
      });
      databaseBuilder.factory.buildArea({
        id: 'area456',
        code: '2',
        frameworkId: 'recFmk123',
      });
      databaseBuilder.factory.buildCompetence({
        id: 'competence123',
        index: '3',
        areaId: 'area123',
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: ['id persistant', 'Sous-domaine', 'Domaine (id persistant)'] });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'competence123',
          index: '1',
          areaId: 'area456',
          createdAt: new Date('2025-09-23T00:00:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'competence456',
          index: '2',
          areaId: 'area456',
          createdAt: new Date('2025-09-23T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads areas from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123', {
            fields: {
              'id persistant': 'competence123',
              'Sous-domaine': '1',
              'Domaine (id persistant)': ['area456'],
            },
            createdTime: '2025-09-23T00:00:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456', {
            fields: {
              'id persistant': 'competence456',
              'Sous-domaine': '2',
              'Domaine (id persistant)': ['area456'],
            },
            createdTime: '2025-09-23T13:58:00Z',
          }),
        ]);

        databaseBuilder.factory.buildFramework({
          id: 'recFmk123',
          name: 'Un référentiel',
        });
        databaseBuilder.factory.buildArea({
          id: 'area123',
          code: '1',
          frameworkId: 'recFmk123',
        });
        databaseBuilder.factory.buildArea({
          id: 'area456',
          code: '2',
          frameworkId: 'recFmk123',
        });
        databaseBuilder.factory.buildCompetence({
          id: 'competence123',
          index: '3',
          areaId: 'area123',
          createdAt: '2025-09-23T00:00:00Z',
          updatedAt: '2025-09-23T10:00:00Z',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: ['id persistant', 'Sous-domaine', 'Domaine (id persistant)'] });

        await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
          {
            id: 'competence123',
            index: '3',
            areaId: 'area123',
            createdAt: new Date('2025-09-23T00:00:00Z'),
            updatedAt: new Date('2025-09-23T10:00:00Z'),
          },
        ]);
      });
    });
  });
});
