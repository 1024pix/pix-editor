import { describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';
import nock from 'nock';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import { tubeDatasource } from '../../../../lib/infrastructure/datasources/airtable/tube-datasource.js';

describe('Integration | Repository | tube-repository', () => {
  describe('#list', () => {
    it('should return the list of all tubes', async () => {
      // given
      const airtableScope = airtableBuilder
        .mockList({ tableName: 'Tubes' })
        .returns([
          airtableBuilder.factory.buildTube({
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
            thematicAirtableId: 'thematicAirtableId1',
            thematicId: 'thematicId1',
            competenceAirtableId: 'competenceAirtableId1',
            competenceId: 'competenceId1',
            skillAirtableIds: ['recSkill1', 'recSkill2'],
            skillIds: ['skill1', 'skill2'],
          }),
          airtableBuilder.factory.buildTube({
            id: 'tubeId2',
            name: '@tube2',
            index: 2,
            practicalTitle_i28n: {
              fr: 'practicalTitleFrFr tube2',
              en: 'practicalTitleEnUs tube2',
            },
            practicalDescription_i18n: {
              fr: 'practicalDescriptionFrFr tube2',
              en: 'practicalDescriptionEnUs tube2',
            },
            thematicAirtableId: 'thematicAirtableId2',
            thematicId: 'thematicId2',
            competenceAirtableId: 'competenceAirtableId2',
            competenceId: 'competenceId2',
            skillAirtableIds: ['recSkill3', 'recSkill4'],
            skillIds: ['skill3', 'skill4'],
          }),
        ])
        .activate().nockScope;

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
          airtableId: 'tubeId1',
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
          thematicAirtableId: 'thematicAirtableId1',
          thematicId: 'thematicId1',
          competenceAirtableId: 'competenceAirtableId1',
          competenceId: 'competenceId1',
          skillAirtableIds: ['recSkill1', 'recSkill2'],
          skillIds: ['skill1', 'skill2'],
        }),
        domainBuilder.buildTube({
          id: 'tubeId2',
          airtableId: 'tubeId2',
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
          thematicAirtableId: 'thematicAirtableId2',
          thematicId: 'thematicId2',
          competenceAirtableId: 'competenceAirtableId2',
          competenceId: 'competenceId2',
          skillAirtableIds: ['recSkill3', 'recSkill4'],
          skillIds: ['skill3', 'skill4'],
        }),
      ]);

      airtableScope.done();
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
        thematicAirtableId: 'thematicAirtableId1',
        competenceAirtableId: 'competenceAirtableId1',
        competenceId: 'competenceId1',
        skillAirtableIds: ['recSkill1', 'recSkill2'],
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
      vi.spyOn(airtable, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Tubes') expect.unreachable('Airtable tableName should be Tubes');
        if (options?.filterByFormula !== `{Competences (id persistant)} = ${airtable.stringValue(tube1.competenceId)}`)
          expect.unreachable('Wrong filterByFormula');
        return [
          {
            id: 'airtableTubeId1',
            fields: {
              'id persistant': tube1.id,
              Nom: tube1.name,
              Thematique: [tube1.thematicAirtableId],
              'Thematique (id persistant)': [tube1.thematicId],
              Competences: [tube1.competenceAirtableId],
              'Competences (id persistant)': [tube1.competenceId],
              Index: tube1.index,
              Acquis: tube1.skillAirtableIds,
              'Acquis (id persistant)': tube1.skillIds,
            },
            get: function(field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const tubes = await tubeRepository.listByCompetenceId(tube1.competenceId);

      // then
      expect(tubes).toStrictEqual([
        domainBuilder.buildTube({
          id: 'tubeId1',
          airtableId: 'airtableTubeId1',
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
          thematicAirtableId: 'thematicAirtableId1',
          competenceAirtableId: 'competenceAirtableId1',
          competenceId: 'competenceId1',
          skillAirtableIds: ['recSkill1', 'recSkill2'],
          skillIds: ['skill1', 'skill2'],
        }),
      ]);
    });
  });

  describe('#getByAirtableId', () => {
    let airtableScope;

    it('should retrieve a tube by airtable ID', async () => {
      // given
      const tube = {
        id: 'tube1',
        airtableId: 'recTube1',
        name: '@test',
        index: 3,
        thematicAirtableId: 'thematicAirtableId1',
        thematicId: 'thematicId1',
        competenceAirtableId: 'competenceAirtableId1',
        competenceId: 'competence1',
        skillAirtableIds: ['recSkill1', 'recSkill2'],
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

      airtableScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tubes/recTube1')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableBuilder.factory.buildTube(tube));

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
      const result = await tubeRepository.getByAirtableId('recTube1');

      // then
      expect(result).toStrictEqual(domainBuilder.buildTube(tube));
      expect(airtableScope.isDone()).toBe(true);
    });

    describe('when not found', () => {
      it('should return null', async () => {
        // given
        airtableScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tubes/recTube1')
          .query({})
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(404);

        // when
        const result = await tubeRepository.getByAirtableId('recTube1');

        // then
        expect(result).toBe(null);
      });
    });
  });

  describe('#create', () => {
    it('should save new tube to Airtable and translations to DB', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 0, competenceId: 'competence1' });
      await databaseBuilder.commit();

      const tubeId = 'tube45267428';
      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(tubeId);
      const tube = domainBuilder.buildTube({
        airtableId: null,
        id: null,
        thematicId: null,
      });
      const airtableTube = airtableBuilder.factory.buildTube({
        ...tube,
        airtableId: 'recTube1',
        id: tubeId,
        thematicId: 'thematic1',
      });
      const createRecordSpy = vi
        .spyOn(airtable, 'createRecord')
        .mockResolvedValueOnce(new Airtable.Record('Tubes', airtableTube.id, airtableTube));

      // when
      const createdTube = await tubeRepository.create(tube);

      // then
      expect(createdTube).toStrictEqual(
        domainBuilder.buildTube({
          ...tube,
          airtableId: 'recTube1',
          thematicId: 'thematic1',
        }),
      );
      expect(createRecordSpy).toHaveBeenCalledWith('Tubes', {
        fields: {
          'id persistant': tubeId,
          Nom: tube.name,
          Competences: [tube.competenceAirtableId],
          Index: tube.index,
          Thematique: [tube.thematicAirtableId],
        },
      });

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

  describe('#getManyByAirtableIds', () => {
    it('should return domain tubes', async () => {
      // given
      const tubes = [
        {
          id: 'tube1',
          airtableId: 'recTube1',
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
          thematicAirtableId: 'recThematic1',
          thematicId: 'thematic1',
          competenceId: 'competence1',
          competenceAirtableId: 'recCompetence1',
          skillIds: ['skill1', 'skill2'],
          skillAirtableIds: ['recSkill1', 'recSkill2'],
        },
        {
          id: 'tube2',
          airtableId: 'recTube2',
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
          thematicAirtableId: 'recThematic2',
          thematicId: 'thematic2',
          competenceId: 'competence2',
          competenceAirtableId: 'recCompetence2',
          skillIds: ['skill3', 'skill4'],
          skillAirtableIds: ['recSkill3', 'recSkill4'],
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

      const airtableTubes = tubes.map((tube) =>
        airtableBuilder.factory.buildTube(domainBuilder.buildTubeDatasourceObject(tube)),
      );
      const findRecordsSpy = vi
        .spyOn(airtable, 'findRecords')
        .mockResolvedValueOnce(
          airtableTubes.map(
            (airtableTube) => new Airtable.Record(tubeDatasource.tableName, airtableTube.airtableId, airtableTube),
          ),
        );
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
      const result = await tubeRepository.getManyByAirtableIds(tubes.map((tube) => tube.airtableId));

      // then
      expect(result).toStrictEqual(tubes.map((tube) => domainBuilder.buildTube(tube)));
      expect(findRecordsSpy).toHaveBeenCalledWith(tubeDatasource.tableName, {
        filterByFormula: 'OR(RECORD_ID() = "recTube1", RECORD_ID() = "recTube2")',
        fields: tubeDatasource.usedFields,
        sort: [{ direction: 'asc', field: tubeDatasource.sortField }],
      });
    });
  });

  describe('#update', () => {
    it('should save tube to Airtable and translations to DB', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence2', index: '1.2', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 0, competenceId: 'competence1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic2', index: 0, competenceId: 'competence2' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@avant', index: 0, thematicId: 'thematic2' });

      const tubeUpdates = {
        airtableId: 'recTube1',
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
        competenceAirtableId: 'recCompetence1',
        thematicAirtableId: 'recThematic1',
      };

      const expectedTube = {
        ...tubeUpdates,
        competenceId: 'competence1',
        thematicId: 'thematic1',
        skillAirtableIds: ['recSkill1', 'recSkill2'],
        skillIds: ['skill1', 'skill2'],
      };

      const airtableTube = airtableBuilder.factory.buildTube(expectedTube);
      const updateRecordSpy = vi
        .spyOn(airtable, 'updateRecord')
        .mockResolvedValueOnce(new Airtable.Record('Tubes', airtableTube.id, airtableTube));

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

      const tube = domainBuilder.buildTube(tubeUpdates);

      // when
      const updatedTube = await tubeRepository.update(tube);

      // then
      expect(updatedTube).toStrictEqual(domainBuilder.buildTube(expectedTube));
      expect(updateRecordSpy).toHaveBeenCalledWith('Tubes', {
        id: tubeUpdates.airtableId,
        fields: {
          'id persistant': tubeUpdates.id,
          Nom: tubeUpdates.name,
          Competences: [tubeUpdates.competenceAirtableId],
          Thematique: [tubeUpdates.thematicAirtableId],
          Index: tubeUpdates.index,
        },
      });

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
