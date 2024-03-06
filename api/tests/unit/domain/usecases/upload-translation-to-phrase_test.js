import { describe, expect, it, vi } from 'vitest';
import { uploadTranslationToPhrase } from '../../../../lib/domain/usecases/index.js';
import * as exportTranslationsUseCase from '../../../../lib/domain/usecases/export-translations.js';
import * as deleteUnmentionedKeysAfterUploadJob from '../../../../lib/infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job.js';

describe('Unit | Domain | Usecases | upload-translation-to-phrase', () => {
  it('should upload to Phrase', async () => {
    // given
    const ConfigurationStub = class {};
    const uploadCreateStub = vi.fn().mockResolvedValue({ id: 'upload-id' });
    const UploadsApiStub = class {
      uploadCreate() { return uploadCreateStub(); }
    };
    vi.spyOn(exportTranslationsUseCase, 'exportTranslations').mockImplementation((stream) => stream.end());

    // when
    await uploadTranslationToPhrase({ url: 'https://example.net' }, { Configuration: ConfigurationStub, UploadsApi: UploadsApiStub });

    // then
    expect(uploadCreateStub).toHaveBeenCalled();
  });

  it('should schedule deletion of unmentioned keys', async () => {
    // given
    const ConfigurationStub = class {};
    const uploadCreateStub = vi.fn().mockResolvedValue({ id: 'upload-id' });
    const UploadsApiStub = class {
      uploadCreate() { return uploadCreateStub(); }
    };
    vi.spyOn(exportTranslationsUseCase, 'exportTranslations').mockImplementation((stream) => stream.end());
    const scheduleStub = vi.spyOn(deleteUnmentionedKeysAfterUploadJob, 'schedule').mockResolvedValue();

    // when
    await uploadTranslationToPhrase({ url: 'https://example.net' }, { Configuration: ConfigurationStub, UploadsApi: UploadsApiStub });

    // then
    expect(scheduleStub).toHaveBeenCalledWith({ uploadId: 'upload-id' });
  });
});

