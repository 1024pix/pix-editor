import { describe, expect, it, vi } from 'vitest';
import { downloadTranslationFromPhrase } from '../../../../lib/domain/usecases';
import * as config from '../../../../lib/config.js';

describe('Unit | Domain | Usecases | download-translation-from-phrase', () => {
  it('should not download from Phrase when apiKey is not set', async () => {
    // given
    vi.spyOn(config.phrase, 'apiKey', 'get').mockReturnValue(undefined);

    const ConfigurationStub = vi.fn();

    // when
    await downloadTranslationFromPhrase({ Configuration: ConfigurationStub });

    // then
    expect(ConfigurationStub).not.toHaveBeenCalled();
  });

  it('should not download from Phrase when projectId is not set', async () => {
    // given
    vi.spyOn(config.phrase, 'projectId', 'get').mockReturnValue(undefined);

    const ConfigurationStub = vi.fn();

    // when
    await downloadTranslationFromPhrase({ Configuration: ConfigurationStub });

    // then
    expect(ConfigurationStub).not.toHaveBeenCalled();
  });

  it('should download from Phrase when config is set', async () => {
    // given
    const ConfigurationStub = class {};
    const localesListStub = vi.fn().mockResolvedValue([]);
    const LocalesApiStub = class {
      localesList() { return localesListStub(); }
    };

    // when
    await downloadTranslationFromPhrase({ Configuration: ConfigurationStub, LocalesApi: LocalesApiStub });

    // then
    expect(localesListStub).toHaveBeenCalled();
  });
});
