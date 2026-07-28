import { beforeEach, describe, expect, it } from 'vitest';

import {
  getByCompetenceId,
  getByPhraseProjectId,
  listWithPhraseProjectId,
} from '../../../../lib/infrastructure/repositories/translations-config-repository.js';
import { databaseBuilder, domainBuilder } from '../../../test-helper.js';

describe('Integration | Infrastructure | Repositories | TranslationsConfig', () => {
  beforeEach(async () => {
    databaseBuilder.factory.buildFramework({
      id: 'frameworkPix',
      name: 'Pix',
    });
    databaseBuilder.factory.buildArea({
      id: 'area1',
      code: '1',
      frameworkId: 'frameworkPix',
    });
    databaseBuilder.factory.buildArea({
      id: 'area2',
      code: '2',
      frameworkId: 'frameworkPix',
    });
    databaseBuilder.factory.buildCompetence({
      id: 'competence1',
      index: '1',
      areaId: 'area1',
    });

    databaseBuilder.factory.buildFramework({
      id: 'frameworkPixEdu',
      name: 'Pix+Edu',
    });

    databaseBuilder.factory.buildTranslationsConfig({
      phraseProjectId: 'phrasePix1',
      frameworkId: 'frameworkPix',
      areaId: 'area1',
      weblateComponent: 'weblateComponent1',
      uploadedLocales: ['fr'],
    });
    databaseBuilder.factory.buildTranslationsConfig({
      phraseProjectId: 'phrasePix2',
      frameworkId: 'frameworkPix',
      areaId: 'area2',
      weblateComponent: 'weblateComponent2',
      uploadedLocales: ['fr'],
    });
    databaseBuilder.factory.buildTranslationsConfig({
      phraseProjectId: 'phrasePixEdu',
      frameworkId: 'frameworkPixEdu',
      weblateComponent: 'weblateComponentEdu',
      uploadedLocales: ['fr', 'fr-FR'],
    });
    databaseBuilder.factory.buildTranslationsConfig({
      phraseProjectId: null,
      frameworkId: 'frameworkPixEdu',
      uploadedLocales: ['fr', 'fr-FR'],
    });

    await databaseBuilder.commit();
  });

  describe('#listWithPhraseProjectId', () => {
    it('lists all translations configs with phraseProjectId', async () => {
      // when
      const translationsConfigs = await listWithPhraseProjectId();

      // then
      expect(translationsConfigs).toStrictEqual([
        domainBuilder.buildTranslationsConfig({
          id: expect.any(Number),
          phraseProjectId: 'phrasePix1',
          frameworkId: 'frameworkPix',
          areaId: 'area1',
          weblateComponent: 'weblateComponent1',
          uploadedLocales: ['fr'],
        }),
        domainBuilder.buildTranslationsConfig({
          id: expect.any(Number),
          phraseProjectId: 'phrasePix2',
          frameworkId: 'frameworkPix',
          areaId: 'area2',
          weblateComponent: 'weblateComponent2',
          uploadedLocales: ['fr'],
        }),
        domainBuilder.buildTranslationsConfig({
          id: expect.any(Number),
          phraseProjectId: 'phrasePixEdu',
          frameworkId: 'frameworkPixEdu',
          areaId: null,
          weblateComponent: 'weblateComponentEdu',
          uploadedLocales: ['fr', 'fr-FR'],
        }),
      ]);
    });
  });

  describe('#getByPhraseProjectId', () => {
    it('gets translations config by Phrase project ID', async () => {
      // given
      const phraseProjectId = 'phrasePix2';

      // when
      const translationsConfig = await getByPhraseProjectId(phraseProjectId);

      // then
      expect(translationsConfig).toStrictEqual(
        domainBuilder.buildTranslationsConfig({
          id: expect.any(Number),
          phraseProjectId: 'phrasePix2',
          frameworkId: 'frameworkPix',
          areaId: 'area2',
          weblateComponent: 'weblateComponent2',
          uploadedLocales: ['fr'],
        }),
      );
    });

    describe('when Phrase project ID is unknown', () => {
      it('returns undefined', async () => {
        // given
        const phraseProjectId = 'unknown';

        // when
        const translationsConfig = await getByPhraseProjectId(phraseProjectId);

        // then
        expect(translationsConfig).toBeUndefined();
      });
    });
  });

  describe('#getByCompetenceId', () => {
    it('returns a translation config', async () => {
      // when
      const translationConfig = await getByCompetenceId('competence1');

      // then
      expect(translationConfig).toStrictEqual(
        domainBuilder.buildTranslationsConfig({
          id: expect.any(Number),
          phraseProjectId: 'phrasePix1',
          frameworkId: 'frameworkPix',
          areaId: 'area1',
          weblateComponent: 'weblateComponent1',
          uploadedLocales: ['fr'],
        }),
      );
    });

    describe('when competenceId is unknown', () => {
      it('returns undefined', async () => {
        // given
        const competenceId = 'unknown';

        // when
        const translationsConfig = await getByCompetenceId(competenceId);

        // then
        expect(translationsConfig).toBeUndefined();
      });
    });

    describe('when competence\'s framework has no translationConfig', () => {
      it('returns undefined', async () => {
        // given
        databaseBuilder.factory.buildFramework({
          id: 'frameworkPouet',
          name: 'Pouet',
        });
        databaseBuilder.factory.buildArea({
          id: 'randomAreaId1',
          code: '2',
          frameworkId: 'frameworkPouet',
        });
        databaseBuilder.factory.buildCompetence({
          id: 'randomCompetenceId1',
          index: '1',
          areaId: 'randomAreaId1',
        });

        // when
        const translationsConfig = await getByCompetenceId('randomCompetenceId1');

        // then
        expect(translationsConfig).toBeUndefined();
      });
    });
  });
});
