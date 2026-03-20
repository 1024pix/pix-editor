import { describe, expect, it, vi } from 'vitest';
import { downloadTranslationFromPhrase } from '../../../../lib/domain/usecases/index.js';
import * as config from '../../../../lib/config.js';
import { translationsConfigRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Usecases | download-translation-from-phrase', () => {
  it('should download from Phrase when config is set', async () => {
    // given
    const ConfigurationStub = class {};
    const localesListStub = vi.fn().mockResolvedValue([]);
    const LocalesApiStub = class {
      localesList() {
        return localesListStub();
      }
    };
    vi.spyOn(translationsConfigRepository, 'list').mockResolvedValueOnce([domainBuilder.buildTranslationsConfig({ phraseProjectId: 'PHRASE_AREA_ONE_PROJECT', frameworkId: 'framework1', areaId: 'area1', uploadedLocales: ['fr'] }), domainBuilder.buildTranslationsConfig({ phraseProjectId: 'PHRASE_AREA_TWO_PROJECT', frameworkId: 'framework1', areaId: 'area2', uploadedLocales: ['fr'] })]);

    // when
    await downloadTranslationFromPhrase({ Configuration: ConfigurationStub, LocalesApi: LocalesApiStub });

    // then
    expect(localesListStub).toHaveBeenCalledTimes(2);
  });

  describe('when no phrase API key is defined', () => {
    it('should not download from Phrase', async () => {
      // given
      vi.spyOn(config.phrase, 'apiKey', 'get').mockReturnValue(undefined);
      vi.spyOn(translationsConfigRepository, 'list').mockResolvedValueOnce([domainBuilder.buildTranslationsConfig({ phraseProjectId: 'PHRASE_AREA_ONE_PROJECT', frameworkId: 'framework1', areaId: 'area1', uploadedLocales: ['fr'] }), domainBuilder.buildTranslationsConfig({ phraseProjectId: 'PHRASE_AREA_TWO_PROJECT', frameworkId: 'framework1', areaId: 'area2', uploadedLocales: ['fr'] })]);
      const ConfigurationStub = vi.fn();

      // when
      await downloadTranslationFromPhrase({ Configuration: ConfigurationStub });

      // then
      expect(ConfigurationStub).not.toHaveBeenCalled();
    });
  });

  describe('when no translations config are defined', () => {
    it('should not download from Phrase', async () => {
      // given
      const ConfigurationStub = vi.fn();

      // when
      await downloadTranslationFromPhrase({ Configuration: ConfigurationStub });

      // then
      expect(ConfigurationStub).not.toHaveBeenCalled();
    });
  });
});
