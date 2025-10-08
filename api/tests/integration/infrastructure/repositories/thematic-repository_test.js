import { afterEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as thematicRepository from '../../../../lib/infrastructure/repositories/thematic-repository.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import { thematicDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';

const TABLE_NAME = 'thematics';
const AIRTABLE_NAME = 'Thematiques';

describe('Integration | Repository | thematic-repository', () => {

  describe('#list', () => {
    it('should return the list of all thematics', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 1, competenceId: 'competenceId1' });
      databaseBuilder.factory.buildTube({ id: 'tubeId1', name: '@foo', thematicId: 'thematic1' });
      databaseBuilder.factory.buildTube({ id: 'tubeId2', name: '@bar', thematicId: 'thematic1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId2', index: '1.2', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic2', index: 2, competenceId: 'competenceId2' });
      databaseBuilder.factory.buildTube({ id: 'tubeId3', name: '@fizz', thematicId: 'thematic2' });
      databaseBuilder.factory.buildTube({ id: 'tubeId4', name: '@buzz', thematicId: 'thematic2' });
      databaseBuilder.factory.buildThematic({ id: 'thematic3', index: 3, competenceId: 'competenceId2' });

      const airtableScope = airtableBuilder.mockList({ tableName: 'Thematiques' }).returns([
        airtableBuilder.factory.buildThematic({
          id: 'thematic1',
          competenceId: 'competenceId1',
          competenceAirtableId: 'recCompetenceId1',
          index: 1,
          tubeIds: ['tubeId1', 'tubeId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
        }),
        airtableBuilder.factory.buildThematic({
          id: 'thematic2',
          competenceId: 'competenceId2',
          competenceAirtableId: 'recCompetenceId2',
          index: 2,
          tubeIds: ['tubeId3', 'tubeId4'],
          tubeAirtableIds: ['recTubeId3', 'recTubeId4'],
        }),
        airtableBuilder.factory.buildThematic({
          id: 'thematic3',
          competenceId: 'competenceId2',
          competenceAirtableId: 'recCompetenceId2',
          index: 3,
          tubeIds: null,
          tubeAirtableIds: null,
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
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.thematic3.name',
        locale: 'fr',
        value: 'Nom thématique 3',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.thematic3.name',
        locale: 'en',
        value: 'Thematic 3 name',
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
          competenceAirtableId: 'recCompetenceId1',
          index: 1,
          tubeIds: ['tubeId1', 'tubeId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
          name_i18n: {
            en: 'Thematic 1 name',
            fr: 'Nom thématique 1',
          },
        }),
        domainBuilder.buildThematic({
          id: 'thematic2',
          airtableId: 'thematic2',
          competenceId: 'competenceId2',
          competenceAirtableId: 'recCompetenceId2',
          index: 2,
          tubeIds: ['tubeId3', 'tubeId4'],
          tubeAirtableIds: ['recTubeId3', 'recTubeId4'],
          name_i18n: {
            en: 'Thematic 2 name',
            fr: 'Nom thématique 2',
          },
        }),
        domainBuilder.buildThematic({
          id: 'thematic3',
          airtableId: 'thematic3',
          competenceId: 'competenceId2',
          competenceAirtableId: 'recCompetenceId2',
          index: 3,
          tubeIds: [],
          tubeAirtableIds: [],
          name_i18n: {
            en: 'Thematic 3 name',
            fr: 'Nom thématique 3',
          },
        }),
      ]);

      airtableScope.done();
    });
  });

  describe('#listByCompetenceId', () => {
    it('should retrieve all thematics by competence id', async () => {
      //given
      const competenceId = 'competenceId1';
      const thematicId = 'recThematic1';
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.recThematic1.name',
        locale: 'fr',
        value: 'Nom thématique 1',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'thematic.recThematic1.name',
        locale: 'en',
        value: 'Thematic 1 name',
      });

      await databaseBuilder.commit();
      vi.spyOn(airtable, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Thematiques') expect.unreachable('Airtable tableName should be Tubes');
        if (options?.filterByFormula !==  `{Competence (id persistant)} = ${airtable.stringValue(competenceId)}`) expect.unreachable('Wrong filterByFormula');
        return [{
          id: 'recAirtableThematic1',
          fields: {
            'id persistant': thematicId,
            'Competence (id persistant)': [competenceId],
            'Competence': ['recCompetenceId1'],
            'Tubes (id persistant)': ['tubeId1', 'tubeId2'],
            'Tubes': ['recTubeId1', 'recTubeId2'],
            'Index': 1,
          },
          get: function(field) { return this.fields[field]; },
        }];
      });

      //when
      const thematics = await thematicRepository.listByCompetenceId(competenceId);

      //then
      expect(thematics).toStrictEqual([
        domainBuilder.buildThematic({
          id: 'recThematic1',
          airtableId: 'recAirtableThematic1',
          name_i18n: {
            fr: 'Nom thématique 1',
            en: 'Thematic 1 name',
          },
          competenceId: 'competenceId1',
          competenceAirtableId: 'recCompetenceId1',
          tubeIds: ['tubeId1', 'tubeId2'],
          tubeAirtableIds: ['recTubeId1', 'recTubeId2'],
          index: 1,
        })
      ]);
    });
  });

  describe('#listByCompetenceAirtableId', () => {
    it('should retrieve all thematics by competence id', async () => {
      // given
      const thematic = {
        id: 'thematic1',
        airtableId: 'recThematic1',
        name_i18n: {
          fr: 'Première thématique',
          en: 'First thematic',
        },
        index: 1,
        competenceId: 'competence1',
        competenceAirtableId: 'recCompetence1',
        tubeIds: ['tube1', 'tube2'],
        tubeAirtableIds: ['recTube1', 'recTube2'],
      };

      const airtableThematic = airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject(thematic));
      const findRecordsSpy = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(thematicDatasource.tableName, airtableThematic.airtableId, airtableThematic),
      ]);

      databaseBuilder.factory.buildTranslation({
        key: `thematic.${thematic.id}.name`,
        locale: 'fr',
        value: thematic.name_i18n.fr,
      });
      databaseBuilder.factory.buildTranslation({
        key: `thematic.${thematic.id}.name`,
        locale: 'en',
        value: thematic.name_i18n.en,
      });
      await databaseBuilder.commit();

      // when
      const thematics = await thematicRepository.listByCompetenceAirtableId(thematic.competenceAirtableId);

      // then
      expect(thematics).toStrictEqual([
        domainBuilder.buildThematic(thematic),
      ]);
      expect(findRecordsSpy).toHaveBeenCalledWith(thematicDatasource.tableName, {
        filterByFormula: 'Competence = "recCompetence1"',
        fields: thematicDatasource.usedFields,
      });
    });
  });

  describe('#getMany', () => {
    it('should return corresponding thematics', async () => {
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId2', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic2', index: 2, competenceId: 'competenceId2' });
      databaseBuilder.factory.buildTube({ id: 'tubeId3', name: '@foo', thematicId: 'thematic2' });
      databaseBuilder.factory.buildTube({ id: 'tubeId4', name: '@bar', thematicId: 'thematic2' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId3', index: '1.2', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic3', index: 3, competenceId: 'competenceId3' });
      databaseBuilder.factory.buildTube({ id: 'tubeId5', name: '@fizz', thematicId: 'thematic3' });
      databaseBuilder.factory.buildTube({ id: 'tubeId6', name: '@buzz', thematicId: 'thematic3' });
      await databaseBuilder.commit();

      const thematic2 = airtableBuilder.factory.buildThematic({
        id: 'thematic2',
        competenceId: 'competenceId2',
        index: 2,
        tubeIds: ['tubeId3', 'tubeId4'],
        tubeAirtableIds: ['recTubeId3', 'recTubeId4'],
      });
      const thematic3 = airtableBuilder.factory.buildThematic({
        id: 'thematic3',
        competenceId: 'competenceId3',
        index: 3,
        tubeIds: ['tubeId5', 'tubeId6'],
        tubeAirtableIds: ['recTubeId5', 'recTubeId6'],
      });

      const airtableScope = airtableBuilder.mockList({ tableName: 'Thematiques' }).returns([thematic2, thematic3]).activate().nockScope;

      const result = await thematicRepository.getMany([thematic2.id, thematic3.id]);

      expect(result.map((thematic) => thematic.id)).toEqual([thematic2.id, thematic3.id]);
      airtableScope.done();
    });
  });

  describe('#create', () => {
    afterEach(() => {
      return knex('thematics').delete();
      return knex('translations').delete();
    });

    it('should save new thematic to Airtable and translations to DB', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      await databaseBuilder.commit();

      const thematicId = 'thematic45267428';
      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(thematicId);
      const thematic = domainBuilder.buildThematic({
        airtableId: null,
        id: null,
        competenceId: null,
        tubeAirtableIds: null,
        tubeIds: null,
      });
      const airtableThematic = airtableBuilder.factory.buildThematic({
        ...thematic,
        airtableId: 'recThematic1',
        id: thematicId,
        competenceId: 'competence1',
      });
      const createRecordSpy = vi.spyOn(airtable, 'createRecord').mockResolvedValueOnce(
        new Airtable.Record(AIRTABLE_NAME, airtableThematic.id, airtableThematic),
      );

      // when
      const createdThematic = await thematicRepository.create(thematic);

      // then
      await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
        {
          id: thematicId,
          index: thematic.index,
          competenceId: 'competence1',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
      expect(createdThematic).toStrictEqual(domainBuilder.buildThematic({
        ...thematic,
        competenceId: 'competence1',
        airtableId: 'recThematic1',
        tubeAirtableIds: [],
        tubeIds: [],
      }));
      expect(createRecordSpy).toHaveBeenCalledWith(
        AIRTABLE_NAME,
        {
          fields: {
            'id persistant': thematicId,
            Competence: [thematic.competenceAirtableId],
            Index: thematic.index,
          },
        },
      );
      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toEqual([
        { key: `thematic.${thematicId}.name`, locale: 'en', value: thematic.name_i18n.en },
        { key: `thematic.${thematicId}.name`, locale: 'fr', value: thematic.name_i18n.fr },
      ]);
    });
  });

  describe('#getByAirtableId', () => {
    describe('when not found', () => {
      it('should return null', async () => {
        // given
        const id = 'notfound';
        const findRecordSpy = vi.spyOn(airtable, 'findRecord').mockRejectedValueOnce(new Airtable.Error('', '', 404));

        // when
        const result = await thematicRepository.getByAirtableId(id);

        // then
        expect(result).toBe(null);
        expect(findRecordSpy).toHaveBeenCalledWith(thematicDatasource.tableName, id);
      });
    });

    describe('when found', () => {
      it('should return domain thematic', async () => {
        // given
        const thematic = {
          id: 'thematic1',
          airtableId: 'recThematic1',
          name_i18n: {
            fr: 'Première thématique',
            en: 'First thematic',
          },
          index: 1,
          competenceId: 'competence1',
          competenceAirtableId: 'recCompetence1',
          tubeIds: ['tube1', 'tube2'],
          tubeAirtableIds: ['recTube1', 'recTube2'],
        };
        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic(thematic);
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@bar', thematicId: 'thematic1' });
        const airtableThematic = airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject(thematic));
        const findRecordSpy = vi.spyOn(airtable, 'findRecord').mockResolvedValueOnce(
          new Airtable.Record(thematicDatasource.tableName, airtableThematic.airtableId, airtableThematic),
        );
        databaseBuilder.factory.buildTranslation({ key: `thematic.${thematic.id}.name`, locale: 'fr', value: thematic.name_i18n.fr });
        databaseBuilder.factory.buildTranslation({ key: `thematic.${thematic.id}.name`, locale: 'en', value: thematic.name_i18n.en });
        await databaseBuilder.commit();

        // when
        const result = await thematicRepository.getByAirtableId(thematic.airtableId);

        // then
        expect(result).toStrictEqual(domainBuilder.buildThematic(thematic));
        expect(findRecordSpy).toHaveBeenCalledWith(thematicDatasource.tableName, thematic.airtableId);
      });
    });
  });

  describe('#getManyByAirtableIds', () => {
    it('should return domain thematics', async () => {
      // given
      const thematics = [
        {
          id: 'thematic1',
          airtableId: 'recThematic1',
          name_i18n: {
            fr: 'Première thématique',
            en: 'First thematic',
          },
          index: 1,
          competenceId: 'competence1',
          competenceAirtableId: 'recCompetence1',
          tubeIds: ['tube1', 'tube2'],
          tubeAirtableIds: ['recTube1', 'recTube2'],
        },
        {
          id: 'thematic2',
          airtableId: 'recThematic2',
          name_i18n: {
            fr: 'Deuxième thématique',
            en: 'Second thematic',
          },
          index: 2,
          competenceId: 'competence2',
          competenceAirtableId: 'recCompetence2',
          tubeIds: ['tube3', 'tube4'],
          tubeAirtableIds: ['recTube3', 'recTube4'],
        },
      ];
      const airtableThematics = thematics.map((thematic) => airtableBuilder.factory.buildThematic(domainBuilder.buildThematicDatasourceObject(thematic)));
      const findRecordsSpy = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce(airtableThematics.map((airtableThematic) => new Airtable.Record(thematicDatasource.tableName, airtableThematic.airtableId, airtableThematic)));
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({
        id: 'area1',
        code: '1',
        frameworkId: 'recFmk1',
      });
      databaseBuilder.factory.buildCompetence({
        id: 'competence1',
        index: '1.1',
        areaId: 'area1',
      });
      databaseBuilder.factory.buildCompetence({
        id: 'competence2',
        index: '1.2',
        areaId: 'area1',
      });
      thematics.forEach((thematic) =>
        databaseBuilder.factory.buildThematic(thematic),
      );
      databaseBuilder.factory.buildTube({
        id: 'tube1',
        name: '@foo',
        thematicId: 'thematic1',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube2',
        name: '@bar',
        thematicId: 'thematic1',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube3',
        name: '@baz',
        thematicId: 'thematic2',
      });
      databaseBuilder.factory.buildTube({
        id: 'tube4',
        name: '@foz',
        thematicId: 'thematic2',
      });
      for (const thematic of thematics) {
        databaseBuilder.factory.buildTranslation({ key: `thematic.${thematic.id}.name`, locale: 'fr', value: thematic.name_i18n.fr });
        databaseBuilder.factory.buildTranslation({ key: `thematic.${thematic.id}.name`, locale: 'en', value: thematic.name_i18n.en });
      }
      await databaseBuilder.commit();

      // when
      const result = await thematicRepository.getManyByAirtableIds(thematics.map((thematic) => thematic.airtableId));

      // then
      expect(result).toStrictEqual(thematics.map((thematic) => domainBuilder.buildThematic(thematic)));
      expect(findRecordsSpy).toHaveBeenCalledWith(thematicDatasource.tableName, {
        filterByFormula: 'OR(RECORD_ID() = "recThematic1", RECORD_ID() = "recThematic2")',
        fields: thematicDatasource.usedFields,
        sort: [{ direction: 'asc', field: thematicDatasource.sortField }]
      });
    });
  });

  describe('#update', () => {
    it('should save thematic to Airtable and translations to DB', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', index: 1, competenceId: 'competence1', createdAt: '2025-09-26T14:26:10Z' });
      await databaseBuilder.commit();

      const thematicUpdates = {
        airtableId: 'recThematic1',
        id: 'thematic1',
        name_i18n: {
          fr: '1ère thématique',
          en: '1st thematic',
        },
        index: 2,
        competenceAirtableId: 'recCompetence1',
      };

      const expectedThematic = {
        ...thematicUpdates,
        competenceId: 'competence1',
        tubeAirtableIds: ['recTube1', 'recTube2'],
        tubeIds: ['tube1', 'tube2'],
      };

      const airtableThematic = airtableBuilder.factory.buildThematic(expectedThematic);
      const updateRecordSpy = vi.spyOn(airtable, 'updateRecord').mockResolvedValueOnce(
        new Airtable.Record('Thematiques', airtableThematic.id, airtableThematic),
      );

      databaseBuilder.factory.buildTranslation({ key: `thematic.${thematicUpdates.id}.name`, locale: 'en', value: 'First thematic' });
      databaseBuilder.factory.buildTranslation({ key: `thematic.${thematicUpdates.id}.name`, locale: 'fr', value: 'Première thématique' });
      await databaseBuilder.commit();

      const thematic = domainBuilder.buildThematic(thematicUpdates);

      // when
      const updatedThematic = await thematicRepository.update(thematic);

      // then
      await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
        {
          id: 'thematic1',
          index: 2,
          competenceId: 'competence1',
          createdAt: new Date('2025-09-26T14:26:10Z'),
          updatedAt: expect.any(Date),
        },
      ]);

      expect(updatedThematic).toStrictEqual(domainBuilder.buildThematic(expectedThematic));
      expect(updateRecordSpy).toHaveBeenCalledWith(
        'Thematiques',
        {
          id: thematicUpdates.airtableId,
          fields: {
            'id persistant': thematicUpdates.id,
            Competence: [thematicUpdates.competenceAirtableId],
            Index: thematicUpdates.index,
          },
        },
      );
      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toEqual([
        { key: `thematic.${thematicUpdates.id}.name`, locale: 'en', value: thematicUpdates.name_i18n.en },
        { key: `thematic.${thematicUpdates.id}.name`, locale: 'fr', value: thematicUpdates.name_i18n.fr },
      ]);
    });
  });
});
