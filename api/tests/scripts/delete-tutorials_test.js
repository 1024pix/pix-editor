import { beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';

import { airtableBuilder } from '../test-helper.js';
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

      const records = [
        airtableBuilder.factory.buildTutorial({
          airtableId: 'recTuto1',
          id: 'tuto1',
        }),
        airtableBuilder.factory.buildTutorial({
          airtableId: 'recTuto3',
          id: 'tuto3',
        }),
      ];

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

        const records = [
          airtableBuilder.factory.buildTutorial({
            airtableId: 'recTuto1',
            id: 'tuto1',
          }),
          airtableBuilder.factory.buildTutorial({
            airtableId: 'recTuto3',
            id: 'tuto3',
          }),
        ];

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
