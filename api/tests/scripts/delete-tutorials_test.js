import { beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';

import { airtableBuilder, databaseBuilder, knex } from '../test-helper.js';
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
    let getManyScope, getAirtableIdsByIdsScope, deleteScope;

    beforeEach(async () => {
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
          tagIds: ['tag1', 'tag2'],
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
          tagIds: ['tag2', 'tag3'],
        },
      ];

      databaseBuilder.factory.buildTag({ id: 'tag1', title: 'tag 1' });
      databaseBuilder.factory.buildTag({ id: 'tag2', title: 'tag 2' });
      databaseBuilder.factory.buildTag({ id: 'tag3', title: 'tag 3' });
      tutorials.forEach(databaseBuilder.factory.buildTutorial);
      databaseBuilder.factory.buildTutorial({
        airtableId: 'recTuto4',
        id: 'tuto4',
        title: 'title 4',
        duration: 'duration 4',
        source: 'source 4',
        format: 'format 4',
        link: 'link 4',
        locale: 'locale 4',
        tagIds: ['tag1', 'tag3'],
      });
      await databaseBuilder.commit();

      const records = tutorials.map(airtableBuilder.factory.buildTutorial);

      getManyScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tutoriels')
        .query({
          filterByFormula: 'OR("tuto1" = {id persistant},"tuto2" = {id persistant},"tuto3" = {id persistant})',
          'fields[]': tutorialDatasource.usedFields,
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records });

      getAirtableIdsByIdsScope = nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Tutoriels')
        .query({
          filterByFormula: 'OR("tuto1" = {id persistant},"tuto3" = {id persistant})',
          'fields[]': ['Record ID', 'id persistant'],
        })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, {
          records: records.map((record) => ({
            ...record,
            fields: {
              ...record.fields,
              'Record ID': record.id,
            },
          })),
        });

      deleteScope = nock('https://api.airtable.com')
        .delete('/v0/airtableBaseValue/Tutoriels')
        .query({ 'records[]': ['recTuto1', 'recTuto3'] })
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .reply(200, { records: [{ deleted: true, id: 'recTuto1' }, { deleted: true, id: 'recTuto3' }] });
    });

    it('deletes existing tutorials corresponding to given ids', async () => {
      // given
      const options = {
        dryRun: false,
        id: [
          'tuto1',
          'tuto2',
          'tuto3',
        ],
      };

      // when
      await script.handle({ options, logger });

      // then
      await expect(knex.select('*').from('tutorials').orderBy('id')).resolves.toStrictEqual([
        {
          id: 'tuto4',
          title: 'title 4',
          duration: 'duration 4',
          source: 'source 4',
          format: 'format 4',
          link: 'link 4',
          locale: 'locale 4',
          crush: false,
          level: null,
          license: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
      await expect(
        knex.select('*').from('tutorials-tutorial_tags').orderBy(['tutorialId', 'tutorialTagId']),
      ).resolves.toStrictEqual([{ tutorialId: 'tuto4', tutorialTagId: 'tag1', createdAt: expect.any(Date), updatedAt: expect.any(Date) }, { tutorialId: 'tuto4', tutorialTagId: 'tag3', createdAt: expect.any(Date), updatedAt: expect.any(Date) }]);

      expect(getManyScope.isDone()).toBe(true);
      expect(getAirtableIdsByIdsScope.isDone()).toBe(true);
      expect(deleteScope.isDone()).toBe(true);
    });

    describe('when dryRun option is true', () => {
      it('stops before deletion', async () => {
        // given
        const options = {
          dryRun: true,
          id: [
            'tuto1',
            'tuto2',
            'tuto3',
          ],
        };

        // when
        await script.handle({ options, logger });

        // then
        await expect(knex.select('*').from('tutorials').orderBy('id')).resolves.toStrictEqual([
          {
            id: 'tuto1',
            title: 'title 1',
            duration: 'duration 1',
            source: 'source 1',
            format: 'format 1',
            link: 'link 1',
            locale: 'locale 1',
            crush: false,
            level: null,
            license: null,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          {
            id: 'tuto3',
            title: 'title 3',
            duration: 'duration 3',
            source: 'source 3',
            format: 'format 3',
            link: 'link 3',
            locale: 'locale 3',
            crush: false,
            level: null,
            license: null,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          {
            id: 'tuto4',
            title: 'title 4',
            duration: 'duration 4',
            source: 'source 4',
            format: 'format 4',
            link: 'link 4',
            locale: 'locale 4',
            crush: false,
            level: null,
            license: null,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);
        await expect(
          knex.select('*').from('tutorials-tutorial_tags').orderBy(['tutorialId', 'tutorialTagId']),
        ).resolves.toStrictEqual([
          { tutorialId: 'tuto1', tutorialTagId: 'tag1', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          { tutorialId: 'tuto1', tutorialTagId: 'tag2', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          { tutorialId: 'tuto3', tutorialTagId: 'tag2', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          { tutorialId: 'tuto3', tutorialTagId: 'tag3', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          { tutorialId: 'tuto4', tutorialTagId: 'tag1', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          { tutorialId: 'tuto4', tutorialTagId: 'tag3', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        ]);

        expect(getManyScope.isDone()).toBe(true);
        expect(getAirtableIdsByIdsScope.isDone()).toBe(false);
        expect(deleteScope.isDone()).toBe(false);
      });
    });
  });
});
