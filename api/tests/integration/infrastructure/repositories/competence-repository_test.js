import { describe, expect, it, vi } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../../../test-helper';
import * as competenceRepository from '../../../../lib/infrastructure/repositories/competence-repository.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import { Competence } from '../../../../lib/domain/models/index.js';

const TABLE_NAME = 'competences';

describe('Integration | Repository | competence-repository', () => {
  describe('#list', () => {
    it('should return the list of all competences', async () => {
      // given
      const competences = [
        {
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
          tubeIds: ['tube1', 'tube2'],
        },
        {
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          tubeIds: ['tube3', 'tube4'],
        },
      ];

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Pix' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'recFmk1' });
      competences.forEach((competence) => {
        databaseBuilder.factory.buildCompetence(competence);
        competence.thematicIds.forEach((id) =>
          databaseBuilder.factory.buildThematic({ id, competenceId: competence.id }),
        );
        competence.tubeIds.forEach((id, index) =>
          databaseBuilder.factory.buildTube({
            id,
            name: `@${id}`,
            thematicId: competence.thematicIds[index % competence.thematicIds.length],
          }),
        );
        competence.skillIds.forEach((id, index) =>
          databaseBuilder.factory.buildSkill({ id, tubeId: competence.tubeIds[index % competence.tubeIds.length] }),
        );
      });

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
      const actualCompetences = await competenceRepository.list();

      // then
      expect(actualCompetences).toEqual([
        domainBuilder.buildCompetence({
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
          tubeIds: ['tube1', 'tube2'],
          name_i18n: {
            fr: 'Nom compétence 1',
            en: 'Competence 1 name',
          },
          description_i18n: {
            fr: 'Description compétence 1',
            en: 'Competence 1 description',
          },
        }),
        domainBuilder.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          tubeIds: ['tube3', 'tube4'],
          name_i18n: {
            fr: 'Nom compétence 2',
            en: 'Competence 2 name',
          },
          description_i18n: {
            fr: 'Description compétence 2',
            en: 'Competence 2 description',
          },
        }),
      ]);
    });
  });

  describe('getMany', () => {
    it('should return the list of all competences having given ids with translations', async () => {
      // given
      const competences = [
        {
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
          tubeIds: ['tube1', 'tube2'],
        },
        {
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          tubeIds: ['tube3', 'tube4'],
        },
      ];

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Pix' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'recFmk1' });
      competences.forEach((competence) => {
        databaseBuilder.factory.buildCompetence(competence);
        competence.thematicIds.forEach((id) =>
          databaseBuilder.factory.buildThematic({ id, competenceId: competence.id }),
        );
        competence.tubeIds.forEach((id, index) =>
          databaseBuilder.factory.buildTube({
            id,
            name: `@${id}`,
            thematicId: competence.thematicIds[index % competence.thematicIds.length],
          }),
        );
        competence.skillIds.forEach((id, index) =>
          databaseBuilder.factory.buildSkill({ id, tubeId: competence.tubeIds[index % competence.tubeIds.length] }),
        );
      });

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
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence3.name',
        locale: 'fr',
        value: 'Nom compétence 3',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'competence.competence3.description',
        locale: 'fr',
        value: 'Description compétence 3',
      });

      await databaseBuilder.commit();

      // when
      const actualCompetences = await competenceRepository.getMany(['competence1', 'competence2']);

      // then
      expect(actualCompetences).toEqual([
        domainBuilder.buildCompetence({
          id: 'competence1',
          index: '1.1',
          origin: 'Pix',
          areaId: 'area1',
          skillIds: ['skill1', 'skill2'],
          thematicIds: ['thematic1', 'thematic2'],
          tubeIds: ['tube1', 'tube2'],
          name_i18n: {
            fr: 'Nom compétence 1',
            en: 'Competence 1 name',
          },
          description_i18n: {
            fr: 'Description compétence 1',
            en: 'Competence 1 description',
          },
        }),
        domainBuilder.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          tubeIds: ['tube3', 'tube4'],
          name_i18n: {
            fr: 'Nom compétence 2',
            en: 'Competence 2 name',
          },
          description_i18n: {
            fr: 'Description compétence 2',
            en: 'Competence 2 description',
          },
        }),
      ]);
    });
  });

  describe('#get', () => {
    it('should return the competence by its id', async () => {
      // given
      const competenceId = 'competence2';

      const competence = {
        id: competenceId,
        index: '1.2',
        origin: 'Pix',
        areaId: 'area2',
        skillIds: ['skill3', 'skill4'],
        thematicIds: ['thematic3', 'thematic4'],
        tubeIds: [
          'tube1',
          'tube2',
          'tube3',
        ],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Pix' });
      databaseBuilder.factory.buildArea({ id: 'area2', code: '2', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence(competence);
      competence.thematicIds.forEach((id) =>
        databaseBuilder.factory.buildThematic({ id, competenceId: competence.id }),
      );
      competence.tubeIds.forEach((id, index) =>
        databaseBuilder.factory.buildTube({
          id,
          name: `@${id}`,
          thematicId: competence.thematicIds[index % competence.thematicIds.length],
        }),
      );
      competence.skillIds.forEach((id, index) =>
        databaseBuilder.factory.buildSkill({ id, tubeId: competence.tubeIds[index % competence.tubeIds.length] }),
      );

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
      const actualCompetence = await competenceRepository.get(competenceId);

      // then
      expect(actualCompetence).toStrictEqual(
        domainBuilder.buildCompetence({
          id: 'competence2',
          index: '1.2',
          origin: 'Pix',
          areaId: 'area2',
          skillIds: ['skill3', 'skill4'],
          thematicIds: ['thematic3', 'thematic4'],
          tubeIds: [
            'tube1',
            'tube2',
            'tube3',
          ],
          name_i18n: {
            fr: 'Nom compétence 2',
            en: 'Competence 2 name',
          },
          description_i18n: {
            fr: 'Description compétence 2',
            en: 'Competence 2 description',
          },
        }),
      );
    });

    it('should return null when no competence with id found', async () => {
      // given
      const competenceId = 'coucouMaman';
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
    });
  });

  describe('#create', () => {
    it('inserts competence w/ its translations', async () => {
      // given
      const id = 'competence123Abc';
      const index = '2';
      const nameFr = 'Nouvelle compétence';
      const nameEn = 'New competence';
      const descriptionFr = 'Description nouvelle compétence';
      const descriptionEn = 'New competence description';
      const frameworkId = 'recFmk123';
      const frameworkName = 'Un référentiel';
      const areaId = 'recArea123';

      const generateNewId = vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(id);

      databaseBuilder.factory.buildFramework({
        id: frameworkId,
        name: frameworkName,
      });
      databaseBuilder.factory.buildArea({
        id: areaId,
        code: '1',
        frameworkId,
      });
      await databaseBuilder.commit();

      const competence = new Competence({
        index,
        name_i18n: {
          fr: nameFr,
          en: nameEn,
        },
        description_i18n: {
          fr: descriptionFr,
          en: descriptionEn,
        },
        areaAirtableId: areaId,
      });

      // when
      const createdCompetence = await competenceRepository.create(competence);

      // then
      expect(createdCompetence).toStrictEqual(
        new Competence({
          airtableId: id,
          id,
          index,
          name_i18n: {
            fr: nameFr,
            en: nameEn,
          },
          description_i18n: {
            fr: descriptionFr,
            en: descriptionEn,
          },
          areaId,
          areaAirtableId: areaId,
          origin: frameworkName,
          skillIds: [],
          thematicAirtableIds: [],
          thematicIds: [],
          tubeAirtableIds: [],
          tubeIds: [],
        }),
      );

      expect(generateNewId).toHaveBeenCalledExactlyOnceWith('competence');

      await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
        {
          id,
          index,
          areaId,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });
});
