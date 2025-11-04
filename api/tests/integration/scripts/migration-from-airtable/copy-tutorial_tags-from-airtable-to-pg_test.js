import { beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyTutorialTagsFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-tutorial_tags-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { knex } from '../../../test-helper.js';

const TABLE_NAME = 'tutorial_tags';
const AIRTABLE_NAME = 'Tags';

describe('Integration | Scripts | CopyTutorialTagsFromAirtableToPg', () => {
  /** @type {CopyTutorialTagsFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyTutorialTagsFromAirtableToPg();
  });

  describe('#handle', () => {
    it('reads tutorial tags from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123', {
          fields: {
            'id persistant': 'tag123',
            Nom: '@azerty',
          },
          createdTime: '2025-10-06T00:00:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456', {
          fields: {
            'id persistant': 'tag456',
            Nom: '@qwerty',
          },
          createdTime: '2025-10-06T13:58:00Z',
        }),
      ]);

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: ['id persistant', 'Nom'] });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'tag123',
          title: '@azerty',
          createdAt: new Date('2025-10-06T00:00:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'tag456',
          title: '@qwerty',
          createdAt: new Date('2025-10-06T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads tutorial tags from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123', {
            fields: {
              'id persistant': 'tag123',
              Nom: '@azerty',
            },
            createdTime: '2025-10-06T00:00:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456', {
            fields: {
              'id persistant': 'tag456',
              Nom: '@qwerty',
            },
            createdTime: '2025-10-06T13:58:00Z',
          }),
        ]);

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: ['id persistant', 'Nom'] });

        await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([]);
      });
    });
  });
});
