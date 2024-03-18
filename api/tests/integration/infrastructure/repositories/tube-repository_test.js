import { describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository.js';

describe('Integration | Repository | tube-repository', () => {

  describe('#list', () => {
    it('should return the list of all tubes', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: 'Tubes' }).returns([
        airtableBuilder.factory.buildTube({
          id: 'tubeId1',
          name: '@tube1',
          practicalTitle_i18n: {
            fr: 'practicalTitleFrFr tube1',
            en: 'practicalTitleEnUs tube1',
          },
          practicalDescription_i18n: {
            fr: 'practicalDescriptionFrFr tube1',
            en: 'practicalDescriptionEnUs tube1',
          },
          competenceId: 'competenceId'
        }),
        airtableBuilder.factory.buildTube({
          id: 'tubeId2',
          name: '@tube2',
          practicalTitle_i28n: {
            fr: 'practicalTitleFrFr tube2',
            en: 'practicalTitleEnUs tube2',
          },
          practicalDescription_i18n: {
            fr: 'practicalDescriptionFrFr tube2',
            en: 'practicalDescriptionEnUs tube2',
          },
          competenceId: 'competenceId'
        }),
      ]).activate().nockScope;
      const tube1DescriptionEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalDescription',
        locale: 'en',
        value: 'Identify a web browser and a search engine, know how the search engine works from PG 1'
      });
      const tube1DescriptionFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalDescription',
        locale: 'fr',
        value: 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche from PG 1'
      });
      const tube1TitleEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalTitle',
        locale: 'en',
        value: 'Tools for web from PG 1'
      });
      const tube1TitleFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalTitle',
        locale: 'fr',
        value: 'Outils d\'accès au web from PG 1'
      });
      const tube2DescriptionEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId2.practicalDescription',
        locale: 'en',
        value: 'Identify a web browser and a search engine, know how the search engine works from PG 2'
      });
      const tube2DescriptionFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId2.practicalDescription',
        locale: 'fr',
        value: 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche from PG 2'
      });
      const tube2TitleEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId2.practicalTitle',
        locale: 'en',
        value: 'Tools for web from PG 2'
      });
      const tube2TitleFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId2.practicalTitle',
        locale: 'fr',
        value: 'Outils d\'accès au web from PG 2'
      });

      await databaseBuilder.commit();

      // when
      const tubes = await tubeRepository.list();

      // then
      expect(tubes).toEqual([
        domainBuilder.buildTube({
          id: 'tubeId1',
          name: '@tube1',
          practicalTitle_i18n: {
            fr: tube1TitleFr.value,
            en: tube1TitleEn.value,
          },
          practicalDescription_i18n: {
            fr: tube1DescriptionFr.value,
            en: tube1DescriptionEn.value,
          },
          competenceId: 'competenceId',
        }),
        domainBuilder.buildTube({
          id: 'tubeId2',
          name: '@tube2',
          practicalTitle_i18n: {
            fr: tube2TitleFr.value,
            en: tube2TitleEn.value,
          },
          practicalDescription_i18n: {
            fr: tube2DescriptionFr.value,
            en: tube2DescriptionEn.value,
          },
          competenceId: 'competenceId',
        }),
      ]);

      airtableScope.done();
    });
  });
});
