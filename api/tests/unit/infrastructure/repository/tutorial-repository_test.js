import { describe, it, expect, vi } from 'vitest';
import { tutorialDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { domainBuilder } from '../../../test-helper';
import { tutorialRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Unit | Repository | tutorial-repository', () => {
  describe('#getMany', () => {
    it('should return tutorials by ids', async() => {
      // given
      vi.spyOn(tutorialDatasource, 'filter').mockResolvedValue([
        {
          id: 'tutorialId',
          duration: 'tuto durée',
          format: 'tuto format',
          link: 'lien',
          source: 'source',
          title: 'title',
          locale: 'myLocale',
          tutorialForSkills: ['skillId1'],
          furtherInformation: ['skillId2'],
        },
        {
          id: 'tutorialId2',
          duration: 'tuto durée2',
          format: 'tuto format2',
          link: 'lien2',
          source: 'source2',
          title: 'title2',
          locale: 'myLocale2',
          tutorialForSkills: ['skillId1'],
          furtherInformation: ['skillId2'],
        }
      ]);

      // when
      const tutorials = await tutorialRepository.getMany(['tutorialId', 'tutorialId2']);

      // then
      expect(tutorialDatasource.filter).toHaveBeenCalledWith({ filter: { ids: ['tutorialId', 'tutorialId2'] } });
      expect(tutorials).toEqual([
        domainBuilder.buildTutorial({
          id: 'tutorialId',
          locale: 'myLocale',
        }),
        domainBuilder.buildTutorial({
          id: 'tutorialId2',
          locale: 'myLocale2',
        })
      ]);
    });
  });
});
