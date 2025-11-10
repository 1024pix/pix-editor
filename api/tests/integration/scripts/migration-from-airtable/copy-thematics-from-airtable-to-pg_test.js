import { beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyThematicsFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-thematics-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, knex } from '../../../test-helper.js';

const TABLE_NAME = 'thematics';
const AIRTABLE_NAME = 'Thematiques';

describe('Integration | Scripts | CopyThematicsFromAirtableToPg', () => {
  /** @type {CopyThematicsFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyThematicsFromAirtableToPg();
  });

  describe('#handle', () => {
    it('reads thematics from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123', {
          fields: {
            'id persistant': 'thematic123',
            Index: 0,
            'Competence (id persistant)': ['competence123'],
          },
          createdTime: '2025-09-29T00:00:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456', {
          fields: {
            'id persistant': 'thematic456',
            Index: 1,
            'Competence (id persistant)': ['competence123'],
          },
          createdTime: '2025-09-29T13:58:00Z',
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
      databaseBuilder.factory.buildCompetence({
        id: 'competence123',
        index: '1.1',
        areaId: 'area123',
      });
      databaseBuilder.factory.buildThematic({
        id: 'thematic123',
        index: 666,
        competenceId: 'competence123',
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: [
          'id persistant',
          'Index',
          'Competence (id persistant)',
        ],
      });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'thematic123',
          index: 0,
          competenceId: 'competence123',
          createdAt: new Date('2025-09-29T00:00:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'thematic456',
          index: 1,
          competenceId: 'competence123',
          createdAt: new Date('2025-09-29T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads thematics from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123', {
            fields: {
              'id persistant': 'thematic123',
              Index: 0,
              'Competence (id persistant)': ['competence123'],
            },
            createdTime: '2025-09-29T00:00:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456', {
            fields: {
              'id persistant': 'thematic456',
              Index: 1,
              'Competence (id persistant)': ['competence123'],
            },
            createdTime: '2025-09-29T13:58:00Z',
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
        databaseBuilder.factory.buildCompetence({
          id: 'competence123',
          index: '1.1',
          areaId: 'area123',
        });
        databaseBuilder.factory.buildThematic({
          id: 'thematic123',
          index: 666,
          competenceId: 'competence123',
          createdAt: '2025-09-29T00:00:00Z',
          updatedAt: '2025-09-29T10:00:00Z',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
          fields: [
            'id persistant',
            'Index',
            'Competence (id persistant)',
          ],
        });

        await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
          {
            id: 'thematic123',
            index: 666,
            competenceId: 'competence123',
            createdAt: new Date('2025-09-29T00:00:00Z'),
            updatedAt: new Date('2025-09-29T10:00:00Z'),
          },
        ]);
      });
    });
  });
});
