import { describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper';
import * as competenceRepository from '../../../../lib/infrastructure/repositories/competence-repository.js';

describe('Integration | Repository | competence-repository', () => {

  describe('#list', () => {
    it('should return the list of all competences', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: 'Competences' }).returns([
        airtableBuilder.factory.buildCompetence({
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
        }),
        airtableBuilder.factory.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
        }),
      ]).activate().nockScope;

      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.name',
        locale: 'fr',
        value: 'Nom compétence 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.description',
        locale: 'fr',
        value: 'Description compétence 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.name',
        locale: 'en',
        value: 'Competence 1 name',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.description',
        locale: 'en',
        value: 'Competence 1 description',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.name',
        locale: 'fr',
        value: 'Nom compétence 2',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.description',
        locale: 'fr',
        value: 'Description compétence 2',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.name',
        locale: 'en',
        value: 'Competence 2 name',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence2.description',
        locale: 'en',
        value: 'Competence 2 description',
      });

      await databaseBuilder.commit();

      // when
      const competences = await competenceRepository.list();

      // then
      expect(competences).toEqual([
        domainBuilder.buildCompetence({
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
          name_i18n: {
            fr: 'Nom compétence 1',
            en: 'Competence 1 name',
          },
          description_i18n:  {
            fr: 'Description compétence 1',
            en: 'Competence 1 description',
          }
        }),
        domainBuilder.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          name_i18n: {
            fr: 'Nom compétence 2',
            en: 'Competence 2 name',
          },
          description_i18n:  {
            fr: 'Description compétence 2',
            en: 'Competence 2 description',
          }
        }),
      ]);

      airtableScope.done();
    });
  });
});
