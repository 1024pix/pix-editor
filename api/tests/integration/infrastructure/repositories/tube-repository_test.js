import { describe, expect, it, vi } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import { Tube } from '../../../../lib/domain/models/index.js';

describe('Integration | Repository | tube-repository', () => {
  describe('#list', () => {
    it('should return the list of all tubes', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematicId1', competenceId: 'competenceId1' });
      databaseBuilder.factory.buildTube({ id: 'tubeId1', name: '@tube1', index: 1, thematicId: 'thematicId1' });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tubeId1' });
      databaseBuilder.factory.buildSkill({ id: 'skill2', tubeId: 'tubeId1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId2', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematicId2', competenceId: 'competenceId2' });
      databaseBuilder.factory.buildTube({ id: 'tubeId2', name: '@tube2', index: 2, thematicId: 'thematicId2' });
      databaseBuilder.factory.buildSkill({ id: 'skill3', tubeId: 'tubeId2' });
      databaseBuilder.factory.buildSkill({ id: 'skill4', tubeId: 'tubeId2' });

      const tube1DescriptionEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalDescription',
        locale: 'en',
        value: 'Identify a web browser and a search engine, know how the search engine works from PG 1',
      });
      const tube1DescriptionFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalDescription',
        locale: 'fr',
        value:
          'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche from PG 1',
      });
      const tube1TitleEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalTitle',
        locale: 'en',
        value: 'Tools for web from PG 1',
      });
      const tube1TitleFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalTitle',
        locale: 'fr',
        value: "Outils d'accès au web from PG 1",
      });
      const tube2DescriptionEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId2.practicalDescription',
        locale: 'en',
        value: 'Identify a web browser and a search engine, know how the search engine works from PG 2',
      });
      const tube2DescriptionFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId2.practicalDescription',
        locale: 'fr',
        value:
          'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche from PG 2',
      });
      const tube2TitleEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId2.practicalTitle',
        locale: 'en',
        value: 'Tools for web from PG 2',
      });
      const tube2TitleFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId2.practicalTitle',
        locale: 'fr',
        value: "Outils d'accès au web from PG 2",
      });

      await databaseBuilder.commit();

      // when
      const tubes = await tubeRepository.list();

      // then
      expect(tubes).toEqual([
        domainBuilder.buildTube({
          id: 'tubeId1',
          name: '@tube1',
          index: 1,
          practicalTitle_i18n: {
            fr: tube1TitleFr.value,
            en: tube1TitleEn.value,
          },
          practicalDescription_i18n: {
            fr: tube1DescriptionFr.value,
            en: tube1DescriptionEn.value,
          },
          thematicId: 'thematicId1',
          competenceId: 'competenceId1',
          skillIds: ['skill1', 'skill2'],
        }),
        domainBuilder.buildTube({
          id: 'tubeId2',
          name: '@tube2',
          index: 2,
          practicalTitle_i18n: {
            fr: tube2TitleFr.value,
            en: tube2TitleEn.value,
          },
          practicalDescription_i18n: {
            fr: tube2DescriptionFr.value,
            en: tube2DescriptionEn.value,
          },
          thematicId: 'thematicId2',
          competenceId: 'competenceId2',
          skillIds: ['skill3', 'skill4'],
        }),
      ]);
    });
  });

  describe('#listByCompetenceId', () => {
    it('should retrieve all tubes by competence id', async () => {
      // given
      const tube1 = {
        id: 'tubeId1',
        name: '@tube1',
        index: 1,
        practicalTitle_i18n: {
          fr: 'practicalTitleFrFr tube1',
          en: 'practicalTitleEnUs tube1',
        },
        practicalDescription_i18n: {
          fr: 'practicalDescriptionFrFr tube1',
          en: 'practicalDescriptionEnUs tube1',
        },
        thematicId: 'thematicId1',
        competenceId: 'competenceId1',
        skillIds: ['skill1', 'skill2'],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: tube1.competenceId, index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: tube1.thematicId, competenceId: tube1.competenceId });
      databaseBuilder.factory.buildTube(tube1);
      tube1.skillIds.forEach((id) => databaseBuilder.factory.buildSkill({ id, tubeId: tube1.id }));

      const tube1DescriptionEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalDescription',
        locale: 'en',
        value: 'Identify a web browser and a search engine, know how the search engine works from PG 1',
      });
      const tube1DescriptionFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalDescription',
        locale: 'fr',
        value:
          'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche from PG 1',
      });
      const tube1TitleEn = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalTitle',
        locale: 'en',
        value: 'Tools for web from PG 1',
      });
      const tube1TitleFr = databaseBuilder.factory.buildTranslation({
        key: 'tube.tubeId1.practicalTitle',
        locale: 'fr',
        value: "Outils d'accès au web from PG 1",
      });
      await databaseBuilder.commit();

      // when
      const tubes = await tubeRepository.listByCompetenceId(tube1.competenceId);

      // then
      expect(tubes).toStrictEqual([
        domainBuilder.buildTube({
          id: 'tubeId1',
          name: '@tube1',
          index: 1,
          practicalTitle_i18n: {
            fr: tube1TitleFr.value,
            en: tube1TitleEn.value,
          },
          practicalDescription_i18n: {
            fr: tube1DescriptionFr.value,
            en: tube1DescriptionEn.value,
          },
          thematicId: 'thematicId1',
          competenceId: 'competenceId1',
          skillIds: ['skill1', 'skill2'],
        }),
      ]);
    });
  });

  describe('#get', () => {
    it('should retrieve a tube by ID', async () => {
      // given
      const tube = {
        id: 'tube1',
        name: '@test',
        index: 3,
        thematicId: 'thematicId1',
        competenceId: 'competence1',
        skillIds: ['skill1', 'skill2'],
        practicalTitle_i18n: {
          fr: 'le titre',
          en: 'the title',
        },
        practicalDescription_i18n: {
          fr: 'la description',
          en: 'the description',
        },
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: tube.competenceId, index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: tube.thematicId, competenceId: tube.competenceId });
      databaseBuilder.factory.buildTube(tube);
      tube.skillIds.forEach((id) => databaseBuilder.factory.buildSkill({ id, tubeId: tube.id }));

      databaseBuilder.factory.buildTranslation({
        key: 'tube.tube1.practicalTitle',
        locale: 'fr',
        value: tube.practicalTitle_i18n.fr,
      });
      databaseBuilder.factory.buildTranslation({
        key: 'tube.tube1.practicalTitle',
        locale: 'en',
        value: tube.practicalTitle_i18n.en,
      });
      databaseBuilder.factory.buildTranslation({
        key: 'tube.tube1.practicalDescription',
        locale: 'fr',
        value: tube.practicalDescription_i18n.fr,
      });
      databaseBuilder.factory.buildTranslation({
        key: 'tube.tube1.practicalDescription',
        locale: 'en',
        value: tube.practicalDescription_i18n.en,
      });
      await databaseBuilder.commit();

      // when
      const result = await tubeRepository.get('tube1');

      // then
      expect(result).toStrictEqual(domainBuilder.buildTube(tube));
    });

    describe('when not found', () => {
      it('should return null', async () => {
        // when
        const result = await tubeRepository.get('recTube1');

        // then
        expect(result).toBe(null);
      });
    });
  });

  describe('#create', () => {
    it('should save new tube and translations to DB', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 0, competenceId: 'competence1' });
      await databaseBuilder.commit();

      const tubeId = 'tube45267428';
      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(tubeId);
      const tube = new Tube({
        thematicAirtableId: 'thematic1',
        name: '@foo',
        index: 3,
        practicalTitle_i18n: {
          fr: 'titre fr',
          en: 'en title',
        },
        practicalDescription_i18n: {
          fr: 'description fr',
          en: 'en description',
        },
      });

      // when
      const createdTube = await tubeRepository.create(tube);

      // then
      expect(createdTube).toStrictEqual(
        domainBuilder.buildTube({
          ...tube,
          id: tubeId,
          competenceId: 'competence1',
          thematicId: 'thematic1',
          skillIds: [],
        }),
      );

      await expect(knex.select('*').from('tubes')).resolves.toStrictEqual([
        {
          id: tubeId,
          name: tube.name,
          index: tube.index,
          thematicId: 'thematic1',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toEqual([
        { key: `tube.${tubeId}.practicalDescription`, locale: 'en', value: tube.practicalDescription_i18n.en },
        { key: `tube.${tubeId}.practicalDescription`, locale: 'fr', value: tube.practicalDescription_i18n.fr },
        { key: `tube.${tubeId}.practicalTitle`, locale: 'en', value: tube.practicalTitle_i18n.en },
        { key: `tube.${tubeId}.practicalTitle`, locale: 'fr', value: tube.practicalTitle_i18n.fr },
      ]);
    });
  });

  describe('#getMany', () => {
    it('should return domain tubes', async () => {
      // given
      const tubes = [
        {
          id: 'tube1',
          name: '@pouic',
          practicalTitle_i18n: {
            fr: 'Titre premier tube',
            en: 'First tube’s title',
          },
          practicalDescription_i18n: {
            fr: 'Description premier tube',
            en: 'First tube’s description',
          },
          index: 1,
          thematicId: 'thematic1',
          competenceId: 'competence1',
          skillIds: ['skill1', 'skill2'],
        },
        {
          id: 'tube2',
          name: '@pouet',
          practicalTitle_i18n: {
            fr: 'Titre deuxième tube',
            en: 'Second tube’s title',
          },
          practicalDescription_i18n: {
            fr: 'Description deuxième tube',
            en: 'Second tube’s description',
          },
          index: 2,
          thematicId: 'thematic2',
          competenceId: 'competence2',
          skillIds: ['skill3', 'skill4'],
        },
      ];

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '1.2', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic2', competenceId: 'competence2' });
      tubes.forEach((tube) => {
        databaseBuilder.factory.buildTube(tube);
        tube.skillIds.forEach((id) => databaseBuilder.factory.buildSkill({ id, tubeId: tube.id }));
      });

      for (const tube of tubes) {
        databaseBuilder.factory.buildTranslation({
          key: `tube.${tube.id}.practicalTitle`,
          locale: 'fr',
          value: tube.practicalTitle_i18n.fr,
        });
        databaseBuilder.factory.buildTranslation({
          key: `tube.${tube.id}.practicalTitle`,
          locale: 'en',
          value: tube.practicalTitle_i18n.en,
        });
        databaseBuilder.factory.buildTranslation({
          key: `tube.${tube.id}.practicalDescription`,
          locale: 'fr',
          value: tube.practicalDescription_i18n.fr,
        });
        databaseBuilder.factory.buildTranslation({
          key: `tube.${tube.id}.practicalDescription`,
          locale: 'en',
          value: tube.practicalDescription_i18n.en,
        });
      }
      await databaseBuilder.commit();

      // when
      const result = await tubeRepository.getMany(tubes.map((tube) => tube.id));

      // then
      expect(result).toStrictEqual(tubes.map((tube) => domainBuilder.buildTube(tube)));
    });
  });

  describe('#update', () => {
    it('should save tube and translations to DB', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '1.2', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 0, competenceId: 'competence1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic2', index: 0, competenceId: 'competence2' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@avant', index: 0, thematicId: 'thematic2' });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildSkill({ id: 'skill2', tubeId: 'tube1' });

      const tubeUpdates = {
        id: 'tube1',
        name: '@test',
        practicalTitle_i18n: {
          fr: 'Titre tube après',
          en: 'Tube’s title after',
        },
        practicalDescription_i18n: {
          fr: 'Description tube après',
          en: 'Tube’s description after',
        },
        index: 2,
        thematicAirtableId: 'thematic1',
      };

      const expectedTube = {
        ...tubeUpdates,
        competenceId: 'competence1',
        thematicId: 'thematic1',
        skillIds: ['skill1', 'skill2'],
      };

      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeUpdates.id}.practicalTitle`,
        locale: 'en',
        value: 'Tube’s title',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeUpdates.id}.practicalTitle`,
        locale: 'fr',
        value: 'Titre tube',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeUpdates.id}.practicalDescription`,
        locale: 'en',
        value: 'Tube’s description',
      });
      databaseBuilder.factory.buildTranslation({
        key: `tube.${tubeUpdates.id}.practicalDescription`,
        locale: 'fr',
        value: 'Description tube',
      });
      await databaseBuilder.commit();

      const tube = new Tube(tubeUpdates);

      // when
      const updatedTube = await tubeRepository.update(tube);

      // then
      expect(updatedTube).toStrictEqual(domainBuilder.buildTube(expectedTube));

      await expect(knex.select('*').from('tubes')).resolves.toStrictEqual([
        {
          id: 'tube1',
          name: '@test',
          index: 2,
          thematicId: 'thematic1',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toEqual([
        {
          key: `tube.${tubeUpdates.id}.practicalDescription`,
          locale: 'en',
          value: tubeUpdates.practicalDescription_i18n.en,
        },
        {
          key: `tube.${tubeUpdates.id}.practicalDescription`,
          locale: 'fr',
          value: tubeUpdates.practicalDescription_i18n.fr,
        },
        { key: `tube.${tubeUpdates.id}.practicalTitle`, locale: 'en', value: tubeUpdates.practicalTitle_i18n.en },
        { key: `tube.${tubeUpdates.id}.practicalTitle`, locale: 'fr', value: tubeUpdates.practicalTitle_i18n.fr },
      ]);
    });
  });
});
