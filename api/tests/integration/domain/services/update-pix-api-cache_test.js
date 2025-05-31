import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import nock from 'nock';
import { Area, Competence, Framework, Thematic } from '../../../../lib/domain/models/index.js';
import * as updatePixApiCache from '../../../../lib/domain/services/update-pix-api-cache.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import * as config from '../../../../lib/config.js';
import { airtableBuilder, databaseBuilder } from '../../../test-helper.js';

describe('Integration | Service | update pix api cache', function() {
  let originalPixApiUrlValue, spyNotify;

  beforeEach(function() {
    spyNotify = vi.spyOn(updatedRecordNotifier, 'notify');
  });

  afterEach(function() {
    config.pixApi.baseUrl = originalPixApiUrlValue;
  });

  describe('#updateFramework', function() {
    let framework;

    beforeEach(function() {
      framework = new Framework({
        id: 'frameworkId',
        name: 'frameworkName',
      });
    });

    context('when patchingPixApi is enabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      context('whether we need to refresh the relationships or not', function() {
        it('should solely patch the framework', async function() {
          // given
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { 'access_token': pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/frameworks/frameworkId',{
              id: 'frameworkId',
              name: 'frameworkName',
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .times(2)
            .reply(200);

          // when
          await updatePixApiCache.updateFramework({ framework, shouldRefreshRelationships: true });
          await updatePixApiCache.updateFramework({ framework, shouldRefreshRelationships: false });

          // then
          expect(pixApiCacheScope.isDone()).to.be.true;
          expect(spyNotify.mock.calls).toMatchObject([
            [{ model: 'frameworks' }],
            [{ model: 'frameworks' }],
          ]);
        });
      });
    });

    context('when patchingPixApi is disabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        delete config.pixApi.baseUrl;
      });

      it('should not patch the framework', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiCache.updateFramework({ framework });

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#updateArea', function() {
    let area;

    beforeEach(function() {
      area = new Area({
        id: 'areaId',
        airtableId: 'areaAirtableId',
        code: '1',
        title_i18n: { fr: 'areaTitle fr', en: 'areaTitle en' },
        competenceIds: ['competenceId1', 'competenceId2'],
        competenceAirtableIds: ['competenceAirtableId1', 'competenceAirtableId2'],
        color: Area.COLORS.CERULEAN,
        frameworkId: 'frameworkId',
      });
    });

    context('when patchingPixApi is enabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      context('whether we need to refresh the relationships or not', function() {
        it('should solely patch the area', async function() {
          // given
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { 'access_token': pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/areas/areaId',{
              id: 'areaId',
              code: '1',
              title_i18n: { fr: 'areaTitle fr', en: 'areaTitle en' },
              competenceIds: ['competenceId1', 'competenceId2'],
              color: Area.COLORS.CERULEAN,
              name: '1. areaTitle fr',
              frameworkId: 'frameworkId',
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .times(2)
            .reply(200);

          // when
          await updatePixApiCache.updateArea({ area, shouldRefreshRelationships: true });
          await updatePixApiCache.updateArea({ area, shouldRefreshRelationships: false });

          // then
          expect(pixApiCacheScope.isDone()).to.be.true;
          expect(spyNotify.mock.calls).toMatchObject([
            [{ model: 'areas' }],
            [{ model: 'areas' }],
          ]);
        });
      });
    });

    context('when patchingPixApi is disabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        delete config.pixApi.baseUrl;
      });

      it('should not patch the area', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiCache.updateArea({ area });

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#updateCompetence', function() {
    let competence;

    beforeEach(function() {
      competence = new Competence({
        id: 'competenceId',
        airtableId: 'competenceAirtableId',
        index: 2,
        origin: 'Pix',
        areaId: 'areaId',
        areaAirtableId: 'areaAirtableId',
        thematicIds: ['thematicId1', 'thematicId2'],
        thematicAirtableIds: ['thematicAirtableId1', 'thematicAirtableId2'],
        tubeAirtableIds: ['tubeAirtableId1', 'tubeAirtableId2'],
        skillIds: ['skillId1', 'skillId2'],
        name_i18n: { fr: 'competenceName fr', en: 'competenceName en' },
        description_i18n: { fr: 'competenceDescription fr', en: 'competenceDescription en' },
      });
    });

    context('when patchingPixApi is enabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      context('when we need to refresh relationships', function() {
        it('should patch both competence and its related area', async function() {
          // given
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { 'access_token': pixApiToken });
          const pixApiCacheCompetenceScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/competences/competenceId', {
              id: 'competenceId',
              index: 2,
              origin: 'Pix',
              areaId: 'areaId',
              thematicIds: ['thematicId1', 'thematicId2'],
              skillIds: ['skillId1', 'skillId2'],
              name_i18n: { fr: 'competenceName fr', en: 'competenceName en' },
              description_i18n: { fr: 'competenceDescription fr', en: 'competenceDescription en' },
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);
          const airtableArea = airtableBuilder.factory.buildArea({
            id: 'areaId',
            airtableId: 'areaAirtableId',
            competenceIds: ['competenceId'],
            competenceAirtableIds: ['competenceAirtableId'],
            code: '2',
            color: Area.COLORS.JAFFA,
            frameworkId: 'frameworkId', });
          databaseBuilder.factory.buildTranslation({
            key: 'area.areaId.title',
            value: 'areaTitle fr',
            locale: 'fr',
          });
          databaseBuilder.factory.buildTranslation({
            key: 'area.areaId.title',
            value: 'areaTitle en',
            locale: 'en',
          });
          await databaseBuilder.commit();
          const airtableAreaScope = nock('https://api.airtable.com')
            .get('/v0/airtableBaseValue/Domaines/areaAirtableId')
            .query({})
            .matchHeader('authorization', 'Bearer airtableApiKeyValue')
            .reply(200, airtableArea);
          const pixApiCacheAreaScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/areas/areaId',{
              id: 'areaId',
              code: '2',
              title_i18n: { fr: 'areaTitle fr', en: 'areaTitle en' },
              competenceIds: ['competenceId'],
              color: Area.COLORS.JAFFA,
              name: '2. areaTitle fr',
              frameworkId: 'frameworkId',
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiCache.updateCompetence({ competence, shouldRefreshRelationships: true });

          // then
          expect(pixApiCacheCompetenceScope.isDone()).to.be.true;
          expect(airtableAreaScope.isDone()).to.be.true;
          expect(pixApiCacheAreaScope.isDone()).to.be.true;
        });
      });

      context('when we do not need to refresh relationships', function() {
        it('should solely patch the competence', async function() {
          // given
          const pixApiToken = 'secret';
          nock('https://some-api-base-url.fr')
            .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
            .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
            .reply(200, { 'access_token': pixApiToken });
          const pixApiCacheScope = nock('https://some-api-base-url.fr')
            .patch('/api/cache/competences/competenceId', {
              id: 'competenceId',
              index: 2,
              origin: 'Pix',
              areaId: 'areaId',
              thematicIds: ['thematicId1', 'thematicId2'],
              skillIds: ['skillId1', 'skillId2'],
              name_i18n: { fr: 'competenceName fr', en: 'competenceName en' },
              description_i18n: { fr: 'competenceDescription fr', en: 'competenceDescription en' },
            })
            .matchHeader('Authorization', `Bearer ${pixApiToken}`)
            .reply(200);

          // when
          await updatePixApiCache.updateCompetence({ competence, shouldRefreshRelationships: false });

          // then
          expect(pixApiCacheScope.isDone()).to.be.true;
        });
      });
    });

    context('when patchingPixApi is disabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        delete config.pixApi.baseUrl;
      });

      it('should not patch the competence', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiCache.updateCompetence({ competence });

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('#updateThematic', function() {
    let thematic;

    beforeEach(function() {
      thematic = new Thematic({
        id: 'thematicId',
        name_i18n: { fr: 'thematicName fr', en: 'thematicName en' },
        index: 1,
        airtableId: 'thematicAirtableId',
        competenceId: 'competenceId',
        competenceAirtableId: 'competenceAirtableId',
        tubeIds: ['tubeId1', 'tubeId2'],
      });
    });

    context('when patchingPixApi is enabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        config.pixApi.baseUrl = 'https://some-api-base-url.fr';
      });

      it('should patch the thematic', async function() {
        // given
        const pixApiToken = 'secret';
        nock('https://some-api-base-url.fr')
          .post('/api/token', { username: 'adminUser', password: '123', grant_type: 'password' })
          .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
          .reply(200, { 'access_token': pixApiToken });
        const pixApiCacheScope = nock('https://some-api-base-url.fr')
          .patch('/api/cache/thematics/thematicId', {
            id: 'thematicId',
            name_i18n: { fr: 'thematicName fr', en: 'thematicName en' },
            index: 1,
            competenceId: 'competenceId',
            tubeIds: ['tubeId1', 'tubeId2'],
          })
          .matchHeader('Authorization', `Bearer ${pixApiToken}`)
          .reply(200);

        // when
        await updatePixApiCache.updateThematic({ thematic });

        // then
        expect(pixApiCacheScope.isDone()).to.be.true;
      });
    });

    context('when patchingPixApi is disabled', function() {

      beforeEach(function() {
        originalPixApiUrlValue = config.pixApi.baseUrl;
        delete config.pixApi.baseUrl;
      });

      it('should not patch the thematic', async function() {
        // given
        const spy = vi.spyOn(updatedRecordNotifier, 'notify');

        // when
        await updatePixApiCache.updateThematic({ thematic });

        // then
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });
});
