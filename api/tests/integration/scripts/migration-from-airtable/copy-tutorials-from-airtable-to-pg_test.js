import { beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyTutorialsFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-tutorials-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { Tutorial } from '../../../../lib/domain/models/Tutorial.js';

const TABLE_NAME = 'tutorials';
const TAGS_RELATION_TABLE_NAME = 'tutorials-tutorial_tags';
const AIRTABLE_NAME = 'Tutoriels';

describe('Integration | Scripts | CopyTutorialsFromAirtableToPg', () => {
  /** @type {CopyTutorialsFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyTutorialsFromAirtableToPg();
  });

  describe('#handle', () => {
    it('reads tutorials from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123', {
          fields: {
            'id persistant': 'tutorial1',
            Titre: 'mon titre 1',
            Format: Tutorial.FORMATS.PDF,
            Durée: '12:01:02',
            Source: 'Mon grenier',
            Lien: 'https://coucou.com',
            Langue: 'fr',
            License: Tutorial.LICENSES.C,
            niveau: Tutorial.LEVELS.TWO,
            CoupDeCoeur: 'YES',
            'Tags (id persistant)': ['tag1', 'tag2'],
          },
          createdTime: '2025-10-10T00:00:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456', {
          fields: {
            'id persistant': 'tutorial2',
            Titre: 'mon titre 2',
            Format: Tutorial.FORMATS.VIDEO,
            Durée: '00:01:02',
            Source: 'Dailymotion',
            Lien: 'https://agaga.com',
            Langue: 'en',
            License: Tutorial.LICENSES.CCBYSA,
            niveau: Tutorial.LEVELS.EIGHT,
            CoupDeCoeur: null,
            'Tags (id persistant)': ['tag2', 'tag3'],
          },
          createdTime: '2025-10-10T13:58:00Z',
        }),
      ]);

      databaseBuilder.factory.buildTag({ id: 'tag1', title: 'Tag 1' });
      databaseBuilder.factory.buildTag({ id: 'tag2', title: 'Tag 2' });
      databaseBuilder.factory.buildTag({ id: 'tag3', title: 'Tag 3' });

      databaseBuilder.factory.buildTutorial({
        id: 'tutorial1',
        title: 'mon titre 1 avant',
        format: Tutorial.FORMATS.FRISE,
        duration: '02:01:02',
        source: 'Ma cave',
        link: 'https://coucoucou.com',
        locale: 'fr-fr',
        license: Tutorial.LICENSES.YOUTUBE,
        level: Tutorial.LEVELS.THREE,
        crush: true,
        tagIds: ['tag1', 'tag3'],
      });

      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: [
          'id persistant',
          'Durée',
          'Format',
          'Lien',
          'Source',
          'Titre',
          'Langue',
          'License',
          'niveau',
          'CoupDeCoeur',
          'Tags (id persistant)',
        ],
      });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'tutorial1',
          title: 'mon titre 1',
          format: Tutorial.FORMATS.PDF,
          duration: '12:01:02',
          source: 'Mon grenier',
          link: 'https://coucou.com',
          locale: 'fr',
          license: Tutorial.LICENSES.C,
          level: Tutorial.LEVELS.TWO,
          crush: true,
          createdAt: new Date('2025-10-10T00:00:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'tutorial2',
          title: 'mon titre 2',
          format: Tutorial.FORMATS.VIDEO,
          duration: '00:01:02',
          source: 'Dailymotion',
          link: 'https://agaga.com',
          locale: 'en',
          license: Tutorial.LICENSES.CCBYSA,
          level: Tutorial.LEVELS.EIGHT,
          crush: false,
          createdAt: new Date('2025-10-10T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(
        knex.select('*').from(TAGS_RELATION_TABLE_NAME).orderBy(['tutorialId', 'tutorialTagId']),
      ).resolves.toStrictEqual([
        { tutorialId: 'tutorial1', tutorialTagId: 'tag1', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { tutorialId: 'tutorial1', tutorialTagId: 'tag2', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { tutorialId: 'tutorial2', tutorialTagId: 'tag2', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { tutorialId: 'tutorial2', tutorialTagId: 'tag3', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads tutorials from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123', {
            fields: {
              'id persistant': 'tutorial1',
              Titre: 'mon titre 1',
              Format: Tutorial.FORMATS.PDF,
              Durée: '12:01:02',
              Source: 'Mon grenier',
              Lien: 'https://coucou.com',
              Langue: 'fr',
              License: Tutorial.LICENSES.C,
              niveau: Tutorial.LEVELS.TWO,
              CoupDeCoeur: 'YES',
              'Tags (id persistant)': ['tag1', 'tag2'],
            },
            createdTime: '2025-10-10T00:00:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456', {
            fields: {
              'id persistant': 'tutorial2',
              Titre: 'mon titre 2',
              Format: Tutorial.FORMATS.VIDEO,
              Durée: '00:01:02',
              Source: 'Dailymotion',
              Lien: 'https://agaga.com',
              Langue: 'en',
              License: Tutorial.LICENSES.CCBYSA,
              niveau: Tutorial.LEVELS.EIGHT,
              CoupDeCoeur: null,
              'Tags (id persistant)': ['tag2', 'tag3'],
            },
            createdTime: '2025-10-10T13:58:00Z',
          }),
        ]);

        databaseBuilder.factory.buildTag({ id: 'tag1', title: 'Tag 1' });
        databaseBuilder.factory.buildTag({ id: 'tag2', title: 'Tag 2' });
        databaseBuilder.factory.buildTag({ id: 'tag3', title: 'Tag 3' });

        databaseBuilder.factory.buildTutorial({
          id: 'tutorial1',
          title: 'mon titre 1 avant',
          format: Tutorial.FORMATS.FRISE,
          duration: '02:01:02',
          source: 'Ma cave',
          link: 'https://coucoucou.com',
          locale: 'fr-fr',
          license: Tutorial.LICENSES.YOUTUBE,
          level: Tutorial.LEVELS.THREE,
          crush: true,
          tagIds: ['tag1', 'tag3'],
          createdAt: '2025-10-06T00:00:00Z',
          updatedAt: '2025-10-06T10:00:00Z',
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
          fields: [
            'id persistant',
            'Durée',
            'Format',
            'Lien',
            'Source',
            'Titre',
            'Langue',
            'License',
            'niveau',
            'CoupDeCoeur',
            'Tags (id persistant)',
          ],
        });

        await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
          {
            id: 'tutorial1',
            title: 'mon titre 1 avant',
            format: Tutorial.FORMATS.FRISE,
            duration: '02:01:02',
            source: 'Ma cave',
            link: 'https://coucoucou.com',
            locale: 'fr-fr',
            license: Tutorial.LICENSES.YOUTUBE,
            level: Tutorial.LEVELS.THREE,
            crush: true,
            createdAt: new Date('2025-10-06T00:00:00Z'),
            updatedAt: new Date('2025-10-06T10:00:00Z'),
          },
        ]);

        await expect(
          knex.select('*').from(TAGS_RELATION_TABLE_NAME).orderBy(['tutorialId', 'tutorialTagId']),
        ).resolves.toStrictEqual([
          { tutorialId: 'tutorial1', tutorialTagId: 'tag1', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          { tutorialId: 'tutorial1', tutorialTagId: 'tag3', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        ]);
      });
    });
  });
});
