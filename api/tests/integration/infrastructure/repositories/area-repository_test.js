import { describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as areaRepository from '../../../../lib/infrastructure/repositories/area-repository.js';

describe('Integration | Repository | area-repository', () => {

  describe('#list', () => {
    it('should return the list of all competences', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: 'Domaines' }).returns([
        airtableBuilder.factory.buildArea({
          id: 'areaId1',
          code: '1',
          color: 'blue da ba di da ba da',
          competenceAirtableIds: ['competenceAirtableId11', 'competenceAirtableId12'],
          competenceIds: ['competenceId11', 'competenceId12'],
          frameworkId: 'frameworkId1',
          name: '1. Premier domaine airtable',
          title_i18n: {
            fr: 'Premier domaine airtable',
            en: 'First area airtable',
          },
        }),
        airtableBuilder.factory.buildArea({
          id: 'areaId2',
          code: '2',
          color: 'caca d\'oie',
          competenceAirtableIds: ['competenceAirtableId21', 'competenceAirtableId22'],
          competenceIds: ['competenceId21', 'competenceId22'],
          frameworkId: 'frameworkId1',
          name: '2. Second domaine airtable',
          title_i18n: {
            fr: 'Second domaine airtable',
            en: 'Second area airtable',
          },
        }),
      ]).activate().nockScope;

      databaseBuilder.factory.buildTranslation({
        key: 'area.areaId1.title',
        locale: 'fr',
        value: 'Premier domaine',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'area.areaId1.title',
        locale: 'en',
        value: 'First area',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'area.areaId2.title',
        locale: 'fr',
        value: 'Second domaine',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'area.areaId2.title',
        locale: 'en',
        value: 'Second area',
      });

      await databaseBuilder.commit();

      // when
      const areas = await areaRepository.list();

      // then
      expect(areas).toEqual([
        domainBuilder.buildArea({
          id: 'areaId1',
          code: '1',
          color: 'blue da ba di da ba da',
          competenceAirtableIds: ['competenceAirtableId11', 'competenceAirtableId12'],
          competenceIds: ['competenceId11', 'competenceId12'],
          frameworkId: 'frameworkId1',
          title_i18n: {
            fr: 'Premier domaine',
            en: 'First area',
          },
        }),
        domainBuilder.buildArea({
          id: 'areaId2',
          code: '2',
          color: 'caca d\'oie',
          competenceAirtableIds: ['competenceAirtableId21', 'competenceAirtableId22'],
          competenceIds: ['competenceId21', 'competenceId22'],
          frameworkId: 'frameworkId1',
          title_i18n: {
            fr: 'Second domaine',
            en: 'Second area',
          },
        }),
      ]);

      airtableScope.done();
    });
  });
});
