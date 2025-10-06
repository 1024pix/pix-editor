import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyTubesFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-tubes-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, knex } from '../../../test-helper.js';

const TABLE_NAME = 'tubes';
const AIRTABLE_NAME = 'Tubes';

describe('Integration | Scripts | CopyTubesFromAirtableToPg', () => {
  /** @type {CopyTubesFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyTubesFromAirtableToPg();
  });

  describe('#handle', () => {
    afterEach(async () => {
      await knex.delete().from(TABLE_NAME);
    });

    it('reads tubes from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123', {
          fields: {
            'id persistant': 'tube123',
            Nom: '@azerty',
            Index: 0,
            'Thematique (id persistant)': ['thematic123'],
          },
          createdTime: '2025-10-06T00:00:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456', {
          fields: {
            'id persistant': 'tube456',
            Nom: '@qwerty',
            Index: 1,
            'Thematique (id persistant)': ['thematic123'],
          },
          createdTime: '2025-10-06T13:58:00Z',
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
        index: 0,
        competenceId: 'competence123',
      });
      databaseBuilder.factory.buildThematic({
        id: 'thematic456',
        index: 0,
        competenceId: 'competence123',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube123',
        name: '@dvorak',
        index: 666,
        thematicId: 'thematic456',
      });
      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: ['id persistant', 'Nom', 'Index', 'Thematique (id persistant)'] });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'tube123',
          name: '@azerty',
          index: 0,
          thematicId: 'thematic123',
          createdAt: new Date('2025-10-06T00:00:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'tube456',
          name: '@qwerty',
          index: 1,
          thematicId: 'thematic123',
          createdAt: new Date('2025-10-06T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads tubes from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123', {
            fields: {
              'id persistant': 'tube123',
              Nom: '@azerty',
              Index: 0,
              'Thematique (id persistant)': ['thematic123'],
            },
            createdTime: '2025-10-06T00:00:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456', {
            fields: {
              'id persistant': 'tube456',
              Nom: '@qwerty',
              Index: 1,
              'Thematique (id persistant)': ['thematic123'],
            },
            createdTime: '2025-10-06T13:58:00Z',
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
          index: 0,
          competenceId: 'competence123',
        });
        databaseBuilder.factory.buildThematic({
          id: 'thematic456',
          index: 0,
          competenceId: 'competence123',
        });
        databaseBuilder.factory.buildTube({
          id: 'tube123',
          name: '@dvorak',
          index: 666,
          thematicId: 'thematic456',
          createdAt: '2025-10-06T00:00:00Z',
          updatedAt: '2025-10-06T10:00:00Z',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: ['id persistant', 'Nom', 'Index', 'Thematique (id persistant)'] });

        await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
          {
            id: 'tube123',
            name: '@dvorak',
            index: 666,
            thematicId: 'thematic456',
            createdAt: new Date('2025-10-06T00:00:00Z'),
            updatedAt: new Date('2025-10-06T10:00:00Z'),
          },
        ]);
      });
    });
  });
});
