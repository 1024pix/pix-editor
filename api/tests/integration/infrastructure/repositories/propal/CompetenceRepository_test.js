import { beforeEach, describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../../test-helper';
import { CompetenceRepository } from '../../../../../lib/infrastructure/repositories/propal/index.js';

describe('Integration | Repository | CompetenceRepository', () => {
  let competenceRepository;
  beforeEach(function() {
    competenceRepository = new CompetenceRepository();
  });

  describe('#list', () => {
    it('should return the list of all competences', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: 'Competences' }).returns([
        airtableBuilder.factory.buildCompetence({
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          areaAirtableId: 'recArea1',
          skillIds: ['skill1', 'skill2'],
          thematicAirtableIds: ['recThematic1', 'recThematic2'],
          thematicIds: ['thematic1', 'thematic2'],
          tubeAirtableIds: ['recTube1', 'recTube2'],
        }),
        airtableBuilder.factory.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          areaAirtableId: 'recArea2',
          skillIds: ['skill3', 'skill4'],
          thematicAirtableIds: ['recThematic3', 'recThematic4'],
          thematicIds: ['thematic3', 'thematic4'],
          tubeAirtableIds: ['recTube3', 'recTube4'],
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
          airtableId: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          areaAirtableId: 'recArea1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
          thematicAirtableIds: ['recThematic1', 'recThematic2'],
          tubeAirtableIds: ['recTube1', 'recTube2'],
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
          airtableId: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          areaAirtableId: 'recArea2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          thematicAirtableIds: ['recThematic3', 'recThematic4'],
          tubeAirtableIds: ['recTube3', 'recTube4'],
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

  describe('#get', () => {
    it('should return the competence by its id', async () => {
      // given
      const competenceId = 'competence2';
      const airtableScope = airtableBuilder.mockList({ tableName: 'Competences' }).returns([
        airtableBuilder.factory.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          areaAirtableId: 'recArea2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          thematicAirtableIds: ['recThematic3', 'recThematic4'],
          tubeAirtableIds: ['recTube1', 'recTube2', 'recTube3'],
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
      const competence = await competenceRepository.get(competenceId);

      // then
      expect(competence).toStrictEqual(domainBuilder.buildCompetence({
        id: 'competence2',
        airtableId: 'competence2',
        index: '1.2',
        origin: 'Pix',
        areaId: 'area2',
        areaAirtableId: 'recArea2',
        skillIds: ['skill3', 'skill4'],
        thematicIds: ['thematic3', 'thematic4'],
        thematicAirtableIds: ['recThematic3', 'recThematic4'],
        tubeAirtableIds: ['recTube1', 'recTube2', 'recTube3'],
        name_i18n: {
          fr: 'Nom compétence 2',
          en: 'Competence 2 name',
        },
        description_i18n:  {
          fr: 'Description compétence 2',
          en: 'Competence 2 description',
        }
      }));
      airtableScope.done();
    });

    it('should return null when no competence with id found', async () => {
      // given
      const competenceId = 'coucouMaman';
      const airtableScope = airtableBuilder.mockList({ tableName: 'Competences' }).returns([]).activate().nockScope;
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence1.name',
        locale: 'fr',
        value: 'Nom compétence 1',
      });
      await databaseBuilder.commit();

      // when
      const competence = await competenceRepository.get(competenceId);

      // then
      expect(competence).toStrictEqual(null);
      airtableScope.done();
    });
  });
});
