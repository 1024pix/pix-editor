import { beforeEach, describe, expect, it } from 'vitest';

import { databaseBuilder, knex } from '../test-helper.js';
import { CreateLocalizedFrameworks } from '../../scripts/create-localized-framework.js';
import { logger } from '../../lib/infrastructure/logger.js';

describe('Script | CreateLocalizedFramework', () => {
  /** @type {CreateLocalizedFrameworks} */
  let script;

  beforeEach(() => {
    script = new CreateLocalizedFrameworks();
  });

  describe('#handle', () => {
    beforeEach(async () => {
      const tube = {
        id: 'tube1',
        name: '@test',
        index: 1,
        competenceId: 'competence1',
        thematicId: 'thematic1',
        skillAirtableIds: ['skill1', 'skill2'],
        skillIds: ['skill1', 'skill2'],
      };

      const otherTube = {
        id: 'tube2',
        name: '@test2',
        index: 2,
        competenceId: 'competence2',
        thematicId: 'thematic2',
        skillAirtableIds: ['skill3', 'skill4'],
        skillIds: ['skill3', 'skill4'],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: tube.competenceId, index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: tube.thematicId, competenceId: tube.competenceId });
      databaseBuilder.factory.buildTube(tube);

      databaseBuilder.factory.buildFramework({ id: 'recFmk2', name: 'Fmk 2' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'recFmk2' });
      databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '2.2', areaId: 'area2' });
      databaseBuilder.factory.buildThematic({ id: 'thematic2', competenceId: 'competence2' });
      databaseBuilder.factory.buildTube(otherTube);

      await databaseBuilder.commit();
    });

    it('creates localizedFrameworkTubes for a given framework, and given locale', async () => {
      // given
      const options = {
        dryRun: false,
        locales: ['fr'],
        frameworkIds: ['recFmk1'],
      };

      // when
      await script.handle({ options, logger });
      const localizedFrameworkTubeId = await knex.pluck('id').from('localized_framework_tubes').where('tubeId', 'tube1');
      // then
      await expect(knex.select('*').from('localized_framework_tubes').orderBy('id')).resolves.toStrictEqual([
        {
          id: localizedFrameworkTubeId[0],
          tubeId: 'tube1',
          maxLevel: 8,
          locale: 'fr',
        },
      ]);
    });

    it('creates localizedFrameworkTubes for 2 given locales and no framework', async () => {
      // given
      const options = {
        dryRun: false,
        locales: ['fr', 'nl'],
      };

      // when
      await script.handle({ options, logger });
      const localizedFrameworkTubeIds = await knex.pluck('id').from('localized_framework_tubes');
      // then
      await expect(knex.select('*').from('localized_framework_tubes').orderBy('id')).resolves.toStrictEqual([
        {
          id: localizedFrameworkTubeIds[0],
          tubeId: 'tube1',
          maxLevel: 8,
          locale: 'fr',
        },
        {
          id: localizedFrameworkTubeIds[1],
          tubeId: 'tube2',
          maxLevel: 8,
          locale: 'fr',
        },
        {
          id: localizedFrameworkTubeIds[2],
          tubeId: 'tube1',
          maxLevel: 8,
          locale: 'nl',
        },
        {
          id: localizedFrameworkTubeIds[3],
          tubeId: 'tube2',
          maxLevel: 8,
          locale: 'nl',
        },
      ]);
    });

    describe('when dryRun option is true', () => {
      it('stops before creation', async () => {
        // given
        const options = {
          dryRun: true,
          locales: ['fr'],
          frameworkIds: ['recFmk1'],
        };

        // when
        await script.handle({ options, logger });

        // then
        await expect(knex.select('*').from('localized_framework_tubes').orderBy('id')).resolves.toStrictEqual([]);
      });
    });
  });
});
