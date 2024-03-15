import { describe, expect, it, vi } from 'vitest';
import { uploadTranslationToPhrase } from '../../../../lib/domain/usecases/index.js';
import * as exportTranslationsUseCase from '../../../../lib/domain/usecases/export-translations.js';
import * as deleteUnmentionedKeysAfterUploadJob from '../../../../lib/infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job.js';
import * as config from '../../../../lib/config.js';

describe('Unit | Domain | Usecases | upload-translation-to-phrase', () => {
  it('should upload to Phrase', async () => {
    // given
    const ConfigurationStub = class {};
    const localesListStub = vi.fn().mockResolvedValue([
      { id: 'frLocaleId', code: 'fr', name: 'fr', _default: true },
    ]);
    const LocalesApiStub = class {
      localesList() { return localesListStub(); }
    };
    const uploadCreateStub = vi.fn().mockResolvedValue({ id: 'upload-id' });
    const UploadsApiStub = class {
      uploadCreate() { return uploadCreateStub(); }
    };
    vi.spyOn(exportTranslationsUseCase, 'exportTranslations').mockImplementation((stream) => stream.end());

    // when
    await uploadTranslationToPhrase({ Configuration: ConfigurationStub, LocalesApi: LocalesApiStub, UploadsApi: UploadsApiStub });

    // then
    expect(uploadCreateStub).toHaveBeenCalled();
  });

  it('should schedule deletion of unmentioned keys', async () => {
    // given
    const ConfigurationStub = class {};
    const localesListStub = vi.fn().mockResolvedValue([
      { id: 'frLocaleId', code: 'fr', name: 'fr', _default: true },
    ]);
    const LocalesApiStub = class {
      localesList() { return localesListStub(); }
    };
    const uploadCreateStub = vi.fn().mockResolvedValue({ id: 'upload-id' });
    const UploadsApiStub = class {
      uploadCreate() { return uploadCreateStub(); }
    };
    vi.spyOn(exportTranslationsUseCase, 'exportTranslations').mockImplementation((stream) => stream.end());
    const scheduleStub = vi.spyOn(deleteUnmentionedKeysAfterUploadJob, 'schedule').mockResolvedValue();

    // when
    await uploadTranslationToPhrase({ Configuration: ConfigurationStub, LocalesApi: LocalesApiStub, UploadsApi: UploadsApiStub });

    // then
    expect(scheduleStub).toHaveBeenCalledWith({ uploadId: 'upload-id' });
  });

  it('should not upload to Phrase when apiKey is not set', async () => {
    // given
    vi.spyOn(config.phrase, 'apiKey', 'get').mockReturnValue(undefined);

    const ConfigurationStub = vi.fn();

    // when
    await uploadTranslationToPhrase({ Configuration: ConfigurationStub });

    // then
    expect(ConfigurationStub).not.toHaveBeenCalled();
  });

  it('should not upload to Phrase when projectId is not set', async () => {
    // given
    vi.spyOn(config.phrase, 'projectId', 'get').mockReturnValue(undefined);

    const ConfigurationStub = vi.fn();

    // when
    await uploadTranslationToPhrase({ Configuration: ConfigurationStub });

    // then
    expect(ConfigurationStub).not.toHaveBeenCalled();
  });
});
