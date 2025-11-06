import { describe, expect, it, vi } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as thematicRepository from '../../../../lib/infrastructure/repositories/thematic-repository.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import { Thematic } from '../../../../lib/domain/models/index.js';

const TABLE_NAME = 'thematics';

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
          competenceId: 'competenceId1',
          index: 1,
          tubeIds: ['tubeId1', 'tubeId2'],
          name_i18n: {
            en: 'Thematic 1 name',
            fr: 'Nom thématique 1',
          },
        }),
        domainBuilder.buildThematic({
          id: 'thematic2',
          competenceId: 'competenceId2',
          index: 2,
          tubeIds: ['tubeId3', 'tubeId4'],
          name_i18n: {
            en: 'Thematic 2 name',
            fr: 'Nom thématique 2',
          },
        }),
        domainBuilder.buildThematic({
          id: 'thematic3',
          competenceId: 'competenceId2',
          index: 3,
          tubeIds: [],
          name_i18n: {
            en: 'Thematic 3 name',
            fr: 'Nom thématique 3',
          },
        }),
      ]);
    });
  });

  describe('#listByCompetenceId', () => {
    it('should retrieve all thematics by competence id', async () => {
      // given
      const competenceId = 'competenceId1';
      const thematicId = 'recThematic1';

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: competenceId, index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: thematicId, index: 1, competenceId });
      databaseBuilder.factory.buildTube({ id: 'tubeId1', name: '@foo', thematicId });
      databaseBuilder.factory.buildTube({ id: 'tubeId2', name: '@bar', thematicId });

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

      // when
      const thematics = await thematicRepository.listByCompetenceId(competenceId);

      // then
      expect(thematics).toStrictEqual([
        domainBuilder.buildThematic({
          id: 'recThematic1',
          name_i18n: {
            fr: 'Nom thématique 1',
            en: 'Thematic 1 name',
          },
          competenceId: 'competenceId1',
          tubeIds: ['tubeId1', 'tubeId2'],
          index: 1,
        }),
      ]);
    });
  });

  describe('#getMany', () => {
    it('should return corresponding thematics', async () => {
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId2', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic2', index: 2, competenceId: 'competenceId2' });
      databaseBuilder.factory.buildCompetence({ id: 'competenceId3', index: '1.2', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic3', index: 3, competenceId: 'competenceId3' });
      await databaseBuilder.commit();

      const result = await thematicRepository.getMany(['thematic2', 'thematic3']);

      expect(result.map((thematic) => thematic.id)).toEqual(['thematic2', 'thematic3']);
    });
  });

  describe('#create', () => {
    it('should save new thematic and translations to DB', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      await databaseBuilder.commit();

      const thematicId = 'thematic45267428';
      vi.spyOn(idGenerator, 'generateNewId').mockReturnValueOnce(thematicId);
      const thematic = new Thematic({
        competenceAirtableId: 'competence1',
        index: 1,
        name_i18n: {
          fr: 'Nom thématique',
          en: 'Thematic name',
        },
      });

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
      expect(createdThematic).toStrictEqual(
        domainBuilder.buildThematic({
          ...thematic,
          competenceId: 'competence1',
          id: thematicId,
          tubeIds: [],
        }),
      );
      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toEqual([{ key: `thematic.${thematicId}.name`, locale: 'en', value: thematic.name_i18n.en }, { key: `thematic.${thematicId}.name`, locale: 'fr', value: thematic.name_i18n.fr }]);
    });
  });

  describe('#get', () => {
    describe('when not found', () => {
      it('should return null', async () => {
        // given
        const id = 'notfound';

        // when
        const result = await thematicRepository.get(id);

        // then
        expect(result).toBe(null);
      });
    });

    describe('when found', () => {
      it('should return domain thematic', async () => {
        // given
        const thematic = {
          id: 'thematic1',
          name_i18n: {
            fr: 'Première thématique',
            en: 'First thematic',
          },
          index: 1,
          competenceId: 'competence1',
          tubeIds: ['tube1', 'tube2'],
        };
        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic(thematic);
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });
        databaseBuilder.factory.buildTube({ id: 'tube2', name: '@bar', thematicId: 'thematic1' });
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
        const result = await thematicRepository.get(thematic.id);

        // then
        expect(result).toStrictEqual(domainBuilder.buildThematic(thematic));
      });
    });
  });

  describe('#update', () => {
    it('should save thematic and translations to DB', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({
        id: 'thematic1',
        index: 1,
        competenceId: 'competence1',
        createdAt: '2025-09-26T14:26:10Z',
      });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@foo', thematicId: 'thematic1' });
      databaseBuilder.factory.buildTube({ id: 'tube2', name: '@bar', thematicId: 'thematic1' });

      const thematicUpdates = {
        id: 'thematic1',
        name_i18n: {
          fr: '1ère thématique',
          en: '1st thematic',
        },
        index: 2,
      };

      const expectedThematic = {
        ...thematicUpdates,
        competenceId: 'competence1',
        tubeIds: ['tube1', 'tube2'],
      };

      databaseBuilder.factory.buildTranslation({
        key: `thematic.${thematicUpdates.id}.name`,
        locale: 'en',
        value: 'First thematic',
      });
      databaseBuilder.factory.buildTranslation({
        key: `thematic.${thematicUpdates.id}.name`,
        locale: 'fr',
        value: 'Première thématique',
      });
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
      await expect(
        knex.select('key', 'locale', 'value').from('translations').orderBy(['key', 'locale']),
      ).resolves.toEqual([{ key: `thematic.${thematicUpdates.id}.name`, locale: 'en', value: thematicUpdates.name_i18n.en }, { key: `thematic.${thematicUpdates.id}.name`, locale: 'fr', value: thematicUpdates.name_i18n.fr }]);
    });
  });
});
