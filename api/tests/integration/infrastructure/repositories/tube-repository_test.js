import { afterEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';
import nock from 'nock';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';

describe('Integration | Repository | tube-repository', () => {

  describe('#list', () => {
    it('should return the list of all tubes', async () => {
      // given
      const airtableScope = airtableBuilder.mockList({ tableName: 'Tubes' }).returns([
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
          competenceAirtableId: 'competenceAirtableId2',
          competenceId: 'competenceId2',
          skillAirtableIds: ['recSkill3', 'recSkill4'],
          skillIds: ['skill3', 'skill4'],
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
      //given
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
        thematicAirtableId: 'thematicAirtableId1',
        competenceAirtableId: 'competenceAirtableId1',
        competenceId: 'competenceId1',
        skillAirtableIds: ['recSkill1', 'recSkill2'],
        skillIds: ['skill1', 'skill2'],
      };
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
      await databaseBuilder.commit();
      vi.spyOn(airtable, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Tubes') expect.unreachable('Airtable tableName should be Tubes');
        if (options?.filterByFormula !==  `{Competences (id persistant)} = ${airtable.stringValue(tube1.competenceId)}`) expect.unreachable('Wrong filterByFormula');
        return [{
          id: 'airtableTubeId1',
          fields: {
            'id persistant': tube1.id,
            'Nom': tube1.name,
            'Thematique': [tube1.thematicAirtableId],
            'Competences': [tube1.competenceAirtableId],
            'Competences (id persistant)': [tube1.competenceId],
            'Index': tube1.index,
            'Acquis': tube1.skillAirtableIds,
            'Acquis (id persistant)': tube1.skillIds,
          },
          get: function(field) { return this.fields[field]; },
        }];
      });

      //when
      const tubes = await tubeRepository.listByCompetenceId(tube1.competenceId);

      //then
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
          thematicAirtableId: 'thematicAirtableId1',
          competenceAirtableId: 'competenceAirtableId1',
          competenceId: 'competenceId1',
          skillAirtableIds: ['recSkill1', 'recSkill2'],
          skillIds: ['skill1', 'skill2'],
        })
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

      airtableScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tubes/recTube1')
        .query({})
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, airtableBuilder.factory.buildTube(tube));

      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'fr', value: tube.practicalTitle_i18n.fr });
      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'en', value: tube.practicalTitle_i18n.en });
      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'fr', value: tube.practicalDescription_i18n.fr });
      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalDescription', locale: 'en', value: tube.practicalDescription_i18n.en });
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
    afterEach(() => {
      return knex('translations').truncate();
    });

    it('should save new tube to Airtable and translations to DB', async () => {
      // given
      const tubeId = 'tube45267428';
      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(tubeId);
      const tube = domainBuilder.buildTube({
        airtableId: null,
        id: null,
      });
      const airtableTube = airtableBuilder.factory.buildTube({
        ...tube,
        airtableId: 'recTube1',
        id: tubeId,
      });
      const createRecordSpy = vi.spyOn(airtable, 'createRecord').mockResolvedValueOnce(
        new Airtable.Record('Tubes', airtableTube.id, airtableTube),
      );

      // when
      const createdTube = await tubeRepository.create(tube);

      // then
      expect(createdTube).toStrictEqual(domainBuilder.buildTube({
        ...tube,
        airtableId: 'recTube1',
      }));
      expect(createRecordSpy).toHaveBeenCalledWith(
        'Tubes',
        {
          fields: {
            'id persistant': tubeId,
            'Nom': tube.name,
            Competences: [tube.competenceAirtableId],
            Index: tube.index,
            'Thematique': [tube.thematicAirtableId],
          },
        },
      );
      await expect(knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale'])).resolves.toEqual([
        { key: `tube.${tubeId}.practicalDescription`, locale: 'en', value: tube.practicalDescription_i18n.en },
        { key: `tube.${tubeId}.practicalDescription`, locale: 'fr', value: tube.practicalDescription_i18n.fr },
        { key: `tube.${tubeId}.practicalTitle`, locale: 'en', value: tube.practicalTitle_i18n.en },
        { key: `tube.${tubeId}.practicalTitle`, locale: 'fr', value: tube.practicalTitle_i18n.fr },
      ]);
    });
  });
});
