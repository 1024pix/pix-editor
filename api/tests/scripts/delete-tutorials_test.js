import { beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder } from '../test-helper.js';
import { DeleteTutorials } from '../../scripts/delete-tutorials.js';
import { logger } from '../../lib/infrastructure/logger.js';
import { tutorialDatasource } from '../../lib/infrastructure/datasources/airtable/index.js';

describe('Script | DeleteTutorials', () => {
  /** @type {DeleteTutorials} */
  let script;

  beforeEach(() => {
    script = new DeleteTutorials();
  });

  describe('#handle', () => {
    it('deletes existing tutorials corresponding to given ids', async () => {
      // given
      const options = {
        dryRun: false,
        id: ['tuto1', 'tuto2', 'tuto3']
      };

      const tutorials = [
        {
          airtableId: 'recTuto1',
          id: 'tuto1',
          title: 'title 1',
          duration: 'duration 1',
          source: 'source 1',
          format: 'format 1',
          link: 'link 1',
          locale: 'locale 1',
        },
        {
          airtableId: 'recTuto3',
          id: 'tuto3',
          title: 'title 3',
          duration: 'duration 3',
          source: 'source 3',
          format: 'format 3',
          link: 'link 3',
          locale: 'locale 3',
        },
      ];

      tutorials.forEach(databaseBuilder.factory.buildTutorial);
      await databaseBuilder.commit();

      const records = tutorials.map(airtableBuilder.factory.buildTutorial);

      const getManyScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tutoriels')
        .query({
          filterByFormula: 'OR("tuto1" = {id persistant},"tuto2" = {id persistant},"tuto3" = {id persistant})',
          'fields[]': tutorialDatasource.usedFields,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records });

      const getAirtableIdsByIdsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tutoriels')
        .query({
          filterByFormula: 'OR("tuto1" = {id persistant},"tuto3" = {id persistant})',
          'fields[]': ['Record ID', 'id persistant'],
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: records.map((record) => ({
          ...record,
          fields: {
            ...record.fields,
            'Record ID': record.id,
          },
        })) });

      const deleteScope = nock('https://api.airtable.com')
        .delete('/v0/airtableBaseValue/Tutoriels')
        .query({
          'records[]': ['recTuto1', 'recTuto3'],
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [
          { deleted: true, id: 'recTuto1', },
          { deleted: true, id: 'recTuto3', },
        ] });

      // when
      await script.handle({ options, logger });

      // then
      expect(getManyScope.isDone()).toBe(true);
      expect(getAirtableIdsByIdsScope.isDone()).toBe(true);
      expect(deleteScope.isDone()).toBe(true);
    });

    describe('when dryRun option is true', () => {
      it('stops before deletion', async () => {
        // given
        const options = {
          dryRun: true,
          id: ['tuto1', 'tuto2', 'tuto3']
        };

        const tutorials = [
          {
            airtableId: 'recTuto1',
            id: 'tuto1',
            title: 'title 1',
            duration: 'duration 1',
            source: 'source 1',
            format: 'format 1',
            link: 'link 1',
            locale: 'locale 1',
          },
          {
            airtableId: 'recTuto3',
            id: 'tuto3',
            title: 'title 3',
            duration: 'duration 3',
            source: 'source 3',
            format: 'format 3',
            link: 'link 3',
            locale: 'locale 3',
          },
        ];

        tutorials.forEach(databaseBuilder.factory.buildTutorial);
        await databaseBuilder.commit();

        const records = tutorials.map(airtableBuilder.factory.buildTutorial);

        const getManyScope = nock('https://api.airtable.com')
          .get('/v0/airtableBaseValue/Tutoriels')
          .query({
            filterByFormula: 'OR("tuto1" = {id persistant},"tuto2" = {id persistant},"tuto3" = {id persistant})',
            'fields[]': tutorialDatasource.usedFields,
          })
          .matchHeader('authorization', 'Bearer airtableApiKeyValue')
          .reply(200, { records });

        // when
        await script.handle({ options, logger });

        // then
        expect(getManyScope.isDone()).toBe(true);
      });
    });
  });
});
