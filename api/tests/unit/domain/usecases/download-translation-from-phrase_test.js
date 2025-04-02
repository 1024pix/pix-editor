import { describe, expect, it, vi } from 'vitest';
import { downloadTranslationFromPhrase } from '../../../../lib/domain/usecases';
import * as config from '../../../../lib/config.js';

describe('Unit | Domain | Usecases | download-translation-from-phrase', () => {

  it('should download from Phrase when config is set', async () => {
    // given
    vi.spyOn(config.phrase, 'projects', 'get').mockReturnValue([{ projectId: 'PHRASE_AREA_ONE_PROJECT', areaCode: 1 }, { projectId : 'PHRASE_AREA_TWO_PROJECT', areaCode: 2 }]);
    const ConfigurationStub = class {};
    const localesListStub = vi.fn().mockResolvedValue([]);
    const LocalesApiStub = class {
      localesList() { return localesListStub(); }
    };

    // when
    await downloadTranslationFromPhrase({ Configuration: ConfigurationStub, LocalesApi: LocalesApiStub });

    // then
    expect(localesListStub).toHaveBeenCalledTimes(2);
  });

  it('should not download from Phrase when apiKey is not set', async () => {
    // given
    vi.spyOn(config.phrase, 'apiKey', 'get').mockReturnValue(undefined);

    const ConfigurationStub = vi.fn();

    // when
    await downloadTranslationFromPhrase({ Configuration: ConfigurationStub });

    // then
    expect(ConfigurationStub).not.toHaveBeenCalled();
  });

  it('should not download from Phrase when projects don\'t have areaCode', async () => {
    // given
    vi.spyOn(config.phrase, 'projects', 'get').mockReturnValue([{ projectId: 'PIX_🍓_REFERENTIEL_❤️' }]);

    const ConfigurationStub = vi.fn();

    // when
    await downloadTranslationFromPhrase({ Configuration: ConfigurationStub });

    // then
    expect(ConfigurationStub).not.toHaveBeenCalled();
  });

  it('should not download from Phrase when projects is empty', async () => {
    // given
    vi.spyOn(config.phrase, 'projects', 'get').mockReturnValue([]);

    const ConfigurationStub = vi.fn();

    // when
    await downloadTranslationFromPhrase({ Configuration: ConfigurationStub });

    // then
    expect(ConfigurationStub).not.toHaveBeenCalled();
  });
});
