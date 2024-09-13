import { describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as thematicRepository from '../../../../lib/infrastructure/repositories/thematic-repository.js';

describe('Integration | Repository | thematic-repository', () => {

  describe('#list', () => {
    it('should return the list of all thematics', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: 'Thematiques' }).returns([
        airtableBuilder.factory.buildThematic({
          id: 'thematic1',
          competenceId: 'competenceId1',
          index: '1',
          tubeIds: ['tubeId1', 'tubeId2'],
        }),
        airtableBuilder.factory.buildThematic({
          id: 'thematic2',
          competenceId: 'competenceId2',
          index: '2',
          tubeIds: ['tubeId3', 'tubeId4'],
        }),
      ]).activate().nockScope;

      databaseBuilder.factory.buildTranslation({
        key: 'thematic.thematic1.name',
        locale: 'fr',
        value: 'Nom thématique 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.thematic1.name',
        locale: 'en',
        value: 'Thematic 1 name',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.thematic2.name',
        locale: 'fr',
        value: 'Nom thématique 2',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.thematic2.name',
        locale: 'en',
        value: 'Thematic 2 name',
      });

      await databaseBuilder.commit();

      // when
      const thematics = await thematicRepository.list();

      // then
      expect(thematics).toEqual([
        domainBuilder.buildThematic({
          id: 'thematic1',
          airtableId: 'thematic1',
          competenceId: 'competenceId1',
          index: '1',
          tubeIds: ['tubeId1', 'tubeId2'],
          name_i18n: {
            en: 'Thematic 1 name',
            fr: 'Nom thématique 1',
          },
        }),
        domainBuilder.buildThematic({
          id: 'thematic2',
          airtableId: 'thematic2',
          competenceId: 'competenceId2',
          index: '2',
          tubeIds: ['tubeId3', 'tubeId4'],
          name_i18n: {
            en: 'Thematic 2 name',
            fr: 'Nom thématique 2',
          },
        }),
      ]);

      airtableScope.done();
    });
  });

  describe('#getMany', () => {
    it('should return corresponding thematics', async () => {
      const thematic2 = airtableBuilder.factory.buildThematic({
        id: 'thematic2',
        competenceId: 'competenceId2',
        index: '2',
        tubeIds: ['tubeId3', 'tubeId4'],
      });
      const thematic3 = airtableBuilder.factory.buildThematic({
        id: 'thematic3',
        competenceId: 'competenceId3',
        index: '3',
        tubeIds: ['tubeId5', 'tubeId6'],
      });

      const airtableScope = airtableBuilder.mockList({ tableName: 'Thematiques' }).returns([thematic2, thematic3]).activate().nockScope;

      const result = await thematicRepository.getMany([thematic2.id, thematic3.id]);

      expect(result.map((thematic) => thematic.id)).toEqual([thematic2.id, thematic3.id]);
      airtableScope.done();
    });
  });
});
