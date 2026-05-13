import { beforeEach, describe, describe as context, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as translationRepository from '../../../../lib/infrastructure/repositories/translation-repository.js';
import { LocalizedEntity } from '../../../../lib/domain/readmodels/index.js';
import { TranslationForReplication } from '../../../../lib/domain/models/replication/index.js';

describe('Integration | Repository | translation-repository', function() {
  context('#save', function() {
    it('should create or update translations', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.id.key1',
        locale: 'fr',
        value: 'key1 fr',
      });
      await databaseBuilder.commit();

      const translations = [
        {
          key: 'entity.id.key1',
          locale: 'fr',
          value: 'key1 fr',
        },
        {
          key: 'entity.id.key2',
          locale: 'fr',
          value: 'key2 fr',
        },
      ];

      // when
      await translationRepository.save({ translations });

      // then
      await expect(knex('translations').select('key', 'locale', 'value').orderBy('key')).resolves.to.deep.equal(
        translations,
      );
    });
  });

  context('#deleteByKeyPrefixAndLocales', function() {
    it('should delete translations having key prefix and locales', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'some.prefix.key',
        locale: 'fr',
        value: 'Bonjour, la mif',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'some.prefix.key',
        locale: 'en',
        value: 'Hello, the mif',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'some.prefix.key',
        locale: 'nl-be',
        value: 'Hallo, het mif',
      });
      await databaseBuilder.commit();

      const prefixToDelete = 'some.prefix.';
      const locales = ['fr', 'en'];

      // when
      await translationRepository.deleteByKeyPrefixAndLocales({ prefix: prefixToDelete, locales });

      // then
      expect(await knex('translations').select('key', 'locale', 'value')).to.deep.equal([
        {
          key: 'some.prefix.key',
          locale: 'nl-be',
          value: 'Hallo, het mif',
        },
      ]);
    });
  });

  context('#searchLocalizedEntities', function() {
    it('should search for fields in entities', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'coucou',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key',
        locale: 'fr',
        value: 'coco',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key2',
        locale: 'fr',
        value: 'coucou',
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.searchLocalizedEntities({
        model: 'entity',
        fields: ['key'],
        search: 'coucou',
      });

      // then
      expect(entityIds).toStrictEqual([
        new LocalizedEntity({
          model: 'entity',
          entityId: 'entityId1',
          locale: 'fr',
        }),
      ]);
    });

    it('should return distinct entity ids', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'coucou',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key2',
        locale: 'fr',
        value: 'coucou',
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.searchLocalizedEntities({
        model: 'entity',
        fields: ['key', 'key2'],
        search: 'coucou',
      });

      // then
      expect(entityIds).toStrictEqual([
        new LocalizedEntity({
          model: 'entity',
          entityId: 'entityId1',
          locale: 'fr',
        }),
      ]);
    });

    it('should return entity ids sorted alphabetically', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key',
        locale: 'fr',
        value: 'coucou',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'coucou',
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.searchLocalizedEntities({
        model: 'entity',
        fields: ['key'],
        search: 'coucou',
      });

      // then
      expect(entityIds).toStrictEqual([
        new LocalizedEntity({
          model: 'entity',
          entityId: 'entityId1',
          locale: 'fr',
        }),
        new LocalizedEntity({
          model: 'entity',
          entityId: 'entityId2',
          locale: 'fr',
        }),
      ]);
    });

    it('should return a limited number of ids', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'coucou',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key',
        locale: 'fr',
        value: 'coucou',
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.searchLocalizedEntities({
        model: 'entity',
        fields: ['key'],
        search: 'coucou',
        limit: 1,
      });

      // then
      expect(entityIds).toStrictEqual([
        new LocalizedEntity({
          model: 'entity',
          entityId: 'entityId1',
          locale: 'fr',
        }),
      ]);
    });

    it('should perform a case-insensitive search', async function() {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId1.key',
        locale: 'fr',
        value: 'Coucou',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.entityId2.key',
        locale: 'fr',
        value: 'coucou',
      });
      await databaseBuilder.commit();

      // when
      const entityIds = await translationRepository.searchLocalizedEntities({
        model: 'entity',
        fields: ['key'],
        search: 'coucou',
        limit: 2,
      });

      // then
      expect(entityIds).toStrictEqual([
        new LocalizedEntity({
          model: 'entity',
          entityId: 'entityId1',
          locale: 'fr',
        }),
        new LocalizedEntity({
          model: 'entity',
          entityId: 'entityId2',
          locale: 'fr',
        }),
      ]);
    });

    describe('when search string contains wildcard characters', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildTranslation({
          key: 'entity.entityId1.key',
          locale: 'fr',
          value: 'aaa N_n aaa',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'entity.entityId2.key',
          locale: 'fr',
          value: 'On est sur de nous à 80% à peu près',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'entity.entityId3.key',
          locale: 'fr',
          value: 'aaa Non aaa',
        });
        await databaseBuilder.commit();
      });

      it('should escape % character', async () => {
        // given
        const searchString = '%';

        // when
        const entityIds = await translationRepository.searchLocalizedEntities({
          model: 'entity',
          fields: ['key'],
          search: searchString,
        });

        // then
        expect(entityIds).toStrictEqual([
          new LocalizedEntity({
            model: 'entity',
            entityId: 'entityId2',
            locale: 'fr',
          }),
        ]);
      });

      it('should escape _ character', async () => {
        // given
        const searchString = 'N_n';

        // when
        const entityIds = await translationRepository.searchLocalizedEntities({
          model: 'entity',
          fields: ['key'],
          search: searchString,
        });

        // then
        expect(entityIds).toStrictEqual([
          new LocalizedEntity({
            model: 'entity',
            entityId: 'entityId1',
            locale: 'fr',
          }),
        ]);
      });
    });
  });

  context('#list', () => {
    it('should list translations ordered by key and locale', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity.id1.field1',
        locale: 'fr',
        value: 'field1 id1 en FR',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.id2.field1',
        locale: 'fr',
        value: 'field1 id2 en FR',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.id2.field2',
        locale: 'en',
        value: 'field2 id2 en EN',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity.id1.field1',
        locale: 'en',
        value: 'field1 id1 en EN',
      });
      await databaseBuilder.commit();

      // when
      const translations = await translationRepository.list();

      // then
      expect(translations).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity.id1.field1',
          locale: 'en',
          value: 'field1 id1 en EN',
        }),
        domainBuilder.buildTranslation({
          key: 'entity.id1.field1',
          locale: 'fr',
          value: 'field1 id1 en FR',
        }),
        domainBuilder.buildTranslation({
          key: 'entity.id2.field1',
          locale: 'fr',
          value: 'field1 id2 en FR',
        }),
        domainBuilder.buildTranslation({
          key: 'entity.id2.field2',
          locale: 'en',
          value: 'field2 id2 en EN',
        }),
      ]);
    });
  });

  context('#listByModel', () => {
    it('should list translations matching first portion of key', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field1',
        locale: 'fr',
        value: 'aaa',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field2',
        locale: 'fr',
        value: 'bbb',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale: 'fr',
        value: 'ccc',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale: 'en',
        value: 'ddd',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity2.id1.field1',
        locale: 'fr',
        value: 'eee',
      });
      await databaseBuilder.commit();

      // when
      const translations1 = await translationRepository.listByModel('entity1');
      const translations2 = await translationRepository.listByModel('entity2');

      // then
      expect(translations1).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity1.id1.field1',
          locale: 'fr',
          value: 'aaa',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id1.field2',
          locale: 'fr',
          value: 'bbb',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale: 'fr',
          value: 'ccc',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale: 'en',
          value: 'ddd',
        }),
      ]);
      expect(translations2).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity2.id1.field1',
          locale: 'fr',
          value: 'eee',
        }),
      ]);
    });
  });

  context('#listByEntity', () => {
    it('should list translations matching first and second portion of key', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field1',
        locale: 'fr',
        value: 'aaa',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field2',
        locale: 'fr',
        value: 'bbb',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale: 'fr',
        value: 'ccc',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale: 'en',
        value: 'ddd',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity2.id1.field1',
        locale: 'fr',
        value: 'eee',
      });
      await databaseBuilder.commit();

      // when
      const translations1 = await translationRepository.listByEntity('entity1', 'id1');
      const translations2 = await translationRepository.listByEntity('entity1', 'id2');
      const translations3 = await translationRepository.listByEntity('entity2', 'id1');

      // then
      expect(translations1).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity1.id1.field1',
          locale: 'fr',
          value: 'aaa',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id1.field2',
          locale: 'fr',
          value: 'bbb',
        }),
      ]);
      expect(translations2).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale: 'fr',
          value: 'ccc',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale: 'en',
          value: 'ddd',
        }),
      ]);
      expect(translations3).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity2.id1.field1',
          locale: 'fr',
          value: 'eee',
        }),
      ]);
    });
  });

  context('#listByEntities', () => {
    it('should list translations matching first and second portion of key', async () => {
      // given
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field1',
        locale: 'fr',
        value: 'aaa',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id1.field2',
        locale: 'fr',
        value: 'bbb',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale: 'fr',
        value: 'ccc',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id2.field1',
        locale: 'en',
        value: 'ddd',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id3.field1',
        locale: 'fr',
        value: 'eee',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity1.id3.field2',
        locale: 'fr',
        value: 'fff',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'entity2.id1.field1',
        locale: 'fr',
        value: 'ggg',
      });
      await databaseBuilder.commit();

      // when
      const translations = await translationRepository.listByEntities('entity1', ['id2', 'id3']);

      // then
      expect(translations).toStrictEqual([
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale: 'fr',
          value: 'ccc',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id2.field1',
          locale: 'en',
          value: 'ddd',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id3.field1',
          locale: 'fr',
          value: 'eee',
        }),
        domainBuilder.buildTranslation({
          key: 'entity1.id3.field2',
          locale: 'fr',
          value: 'fff',
        }),
      ]);
    });
  });

  describe('#streamForReplication', () => {
    it('streams translations for replication', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({ id: 'challenge1', skillId: 'skill1', version: 1 }),
      );
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({ id: 'challenge2', skillId: 'skill1', version: 2 }),
      );
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge1', challengeId: 'challenge1', locale: 'fr' });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge1nl', challengeId: 'challenge1', locale: 'nl' });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge2', challengeId: 'challenge2', locale: 'fr' });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge2en', challengeId: 'challenge2', locale: 'en' });

      databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'fr', value: 'area1 fr' });
      databaseBuilder.factory.buildTranslation({ key: 'area.area1.title', locale: 'en', value: 'area1 en' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.name', locale: 'fr', value: 'competence1 fr' });
      databaseBuilder.factory.buildTranslation({ key: 'competence.competence1.name', locale: 'en', value: 'competence1 en' });
      databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'fr', value: 'thematic1 fr' });
      databaseBuilder.factory.buildTranslation({ key: 'thematic.thematic1.name', locale: 'en', value: 'thematic1 en' });
      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'fr', value: 'tube1 fr' });
      databaseBuilder.factory.buildTranslation({ key: 'tube.tube1.practicalTitle', locale: 'en', value: 'tube1 en' });
      databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'fr', value: 'skill1 fr' });
      databaseBuilder.factory.buildTranslation({ key: 'skill.skill1.hint', locale: 'en', value: 'skill1 en' });
      databaseBuilder.factory.buildTranslation({ key: 'challenge.challenge1.instruction', locale: 'fr', value: 'challenge1 instruction fr' });
      databaseBuilder.factory.buildTranslation({ key: 'challenge.challenge1.instruction', locale: 'nl', value: 'challenge1 instruction nl' });
      databaseBuilder.factory.buildTranslation({ key: 'challenge.challenge1.solution', locale: 'fr', value: 'challenge1 solution fr' });
      databaseBuilder.factory.buildTranslation({ key: 'challenge.challenge1.solution', locale: 'nl', value: 'challenge1 solution nl' });
      databaseBuilder.factory.buildTranslation({ key: 'challenge.challenge2.instruction', locale: 'fr', value: 'challenge2 instruction fr' });
      databaseBuilder.factory.buildTranslation({ key: 'challenge.challenge2.instruction', locale: 'en', value: 'challenge2 instruction en' });
      databaseBuilder.factory.buildTranslation({ key: 'challenge.challenge2.solution', locale: 'fr', value: 'challenge2 solution fr' });
      databaseBuilder.factory.buildTranslation({ key: 'challenge.challenge2.solution', locale: 'en', value: 'challenge2 solution en' });

      await databaseBuilder.commit();

      // when
      const stream = translationRepository.streamForReplication();
      const translations = [];
      for await (const translation of stream) {
        translations.push(translation);
      }

      // then
      expect(translations).toStrictEqual([
        new TranslationForReplication({
          id: 'area.area1.title:en',
          key: 'area.area1.title',
          locale: 'en',
          value: 'area1 en',
          model: 'area',
          entityId: 'area1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'area.area1.title:fr',
          key: 'area.area1.title',
          locale: 'fr',
          value: 'area1 fr',
          model: 'area',
          entityId: 'area1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'challenge.challenge1.instruction:fr',
          key: 'challenge.challenge1.instruction',
          locale: 'fr',
          value: 'challenge1 instruction fr',
          model: 'challenge',
          entityId: 'challenge1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'challenge.challenge1.instruction:nl',
          key: 'challenge.challenge1nl.instruction',
          locale: 'nl',
          value: 'challenge1 instruction nl',
          model: 'challenge',
          entityId: 'challenge1nl',
          sourceEntityId: 'challenge1',
        }),
        new TranslationForReplication({
          id: 'challenge.challenge1.solution:fr',
          key: 'challenge.challenge1.solution',
          locale: 'fr',
          value: 'challenge1 solution fr',
          model: 'challenge',
          entityId: 'challenge1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'challenge.challenge1.solution:nl',
          key: 'challenge.challenge1nl.solution',
          locale: 'nl',
          value: 'challenge1 solution nl',
          model: 'challenge',
          entityId: 'challenge1nl',
          sourceEntityId: 'challenge1',
        }),
        new TranslationForReplication({
          id: 'challenge.challenge2.instruction:en',
          key: 'challenge.challenge2en.instruction',
          locale: 'en',
          value: 'challenge2 instruction en',
          model: 'challenge',
          entityId: 'challenge2en',
          sourceEntityId: 'challenge2',
        }),
        new TranslationForReplication({
          id: 'challenge.challenge2.instruction:fr',
          key: 'challenge.challenge2.instruction',
          locale: 'fr',
          value: 'challenge2 instruction fr',
          model: 'challenge',
          entityId: 'challenge2',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'challenge.challenge2.solution:en',
          key: 'challenge.challenge2en.solution',
          locale: 'en',
          value: 'challenge2 solution en',
          model: 'challenge',
          entityId: 'challenge2en',
          sourceEntityId: 'challenge2',
        }),
        new TranslationForReplication({
          id: 'challenge.challenge2.solution:fr',
          key: 'challenge.challenge2.solution',
          locale: 'fr',
          value: 'challenge2 solution fr',
          model: 'challenge',
          entityId: 'challenge2',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'competence.competence1.name:en',
          key: 'competence.competence1.name',
          locale: 'en',
          value: 'competence1 en',
          model: 'competence',
          entityId: 'competence1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'competence.competence1.name:fr',
          key: 'competence.competence1.name',
          locale: 'fr',
          value: 'competence1 fr',
          model: 'competence',
          entityId: 'competence1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'skill.skill1.hint:en',
          key: 'skill.skill1.hint',
          locale: 'en',
          value: 'skill1 en',
          model: 'skill',
          entityId: 'skill1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'skill.skill1.hint:fr',
          key: 'skill.skill1.hint',
          locale: 'fr',
          value: 'skill1 fr',
          model: 'skill',
          entityId: 'skill1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'thematic.thematic1.name:en',
          key: 'thematic.thematic1.name',
          locale: 'en',
          value: 'thematic1 en',
          model: 'thematic',
          entityId: 'thematic1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'thematic.thematic1.name:fr',
          key: 'thematic.thematic1.name',
          locale: 'fr',
          value: 'thematic1 fr',
          model: 'thematic',
          entityId: 'thematic1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'tube.tube1.practicalTitle:en',
          key: 'tube.tube1.practicalTitle',
          locale: 'en',
          value: 'tube1 en',
          model: 'tube',
          entityId: 'tube1',
          sourceEntityId: null,
        }),
        new TranslationForReplication({
          id: 'tube.tube1.practicalTitle:fr',
          key: 'tube.tube1.practicalTitle',
          locale: 'fr',
          value: 'tube1 fr',
          model: 'tube',
          entityId: 'tube1',
          sourceEntityId: null,
        }),
      ]);
    });
  });
});
