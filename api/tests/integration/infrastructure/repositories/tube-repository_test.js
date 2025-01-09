import { describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import { airtableBuilder, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository.js';
import * as airtableClient from '../../../../lib/infrastructure/airtable.js';
import { stringValue } from '../../../../lib/infrastructure/airtable.js';

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
          competenceId: 'competenceId'
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
          competenceId: 'competenceId',
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
          competenceId: 'competenceId',
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
        competenceId: 'competenceId1',
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
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Tubes') expect.unreachable('Airtable tableName should be Tubes');
        if (options?.filterByFormula !==  `{Competences (id persistant)} = ${stringValue(tube1.competenceId)}`) expect.unreachable('Wrong filterByFormula');
        return [{
          id: 'airtableTubeId1',
          fields: {
            'id persistant': tube1.id,
            'Nom': tube1.name,
            'Competences (id persistant)': [tube1.competenceId],
            'Index': tube1.index,
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
          competenceId: 'competenceId1',
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
        competenceId: 'competence1',
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
});
