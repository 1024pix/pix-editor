import { beforeEach, describe, expect, it } from 'vitest';

import { getByPhraseProjectId, list } from '../../../../lib/infrastructure/repositories/translations-config-repository.js';
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

    databaseBuilder.factory.buildFramework({
      id: 'frameworkPixEdu',
      name: 'Pix+Edu',
    });

    databaseBuilder.factory.buildTranslationsConfig({
      phraseProjectId: 'phrasePix1',
      frameworkId: 'frameworkPix',
      areaId: 'area1',
      uploadedLocales: ['fr'],
    });
    databaseBuilder.factory.buildTranslationsConfig({
      phraseProjectId: 'phrasePix2',
      frameworkId: 'frameworkPix',
      areaId: 'area2',
      uploadedLocales: ['fr'],
    });
    databaseBuilder.factory.buildTranslationsConfig({
      phraseProjectId: 'phrasePixEdu',
      frameworkId: 'frameworkPixEdu',
      uploadedLocales: ['fr', 'fr-FR'],
    });

    await databaseBuilder.commit();
  });

  describe('#list', () => {
    it('lists all translations configs', async () => {
      // when
      const translationsConfigs = await list();

      // then
      expect(translationsConfigs).toStrictEqual([
        domainBuilder.buildTranslationsConfig({
          id: expect.any(Number),
          phraseProjectId: 'phrasePix1',
          frameworkId: 'frameworkPix',
          areaId: 'area1',
          uploadedLocales: ['fr'],
        }),
        domainBuilder.buildTranslationsConfig({
          id: expect.any(Number),
          phraseProjectId: 'phrasePix2',
          frameworkId: 'frameworkPix',
          areaId: 'area2',
          uploadedLocales: ['fr'],
        }),
        domainBuilder.buildTranslationsConfig({
          id: expect.any(Number),
          phraseProjectId: 'phrasePixEdu',
          frameworkId: 'frameworkPixEdu',
          areaId: null,
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
});
