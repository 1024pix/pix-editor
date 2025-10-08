import { describe, expect, it, vi } from 'vitest';
import { uploadTranslationToPhrase } from '../../../../lib/domain/usecases/index.js';
import { localizedChallengeRepository, releaseRepository } from '../../../../lib/infrastructure/repositories/index.js';
import * as exportTranslationsUseCase from '../../../../lib/domain/usecases/export-translations.js';
import * as deleteUnmentionedKeysAfterUploadJob from '../../../../lib/infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job.js';
import * as config from '../../../../lib/config.js';

describe('Unit | Domain | Usecases | upload-translation-to-phrase', () => {
  it('should upload to Phrase', async () => {
    // given
    const release = Symbol('release');
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
    const exportTranslationsStub = vi.spyOn(exportTranslationsUseCase, 'exportTranslations')
      .mockImplementation((stream) => stream.end());
    vi.spyOn(deleteUnmentionedKeysAfterUploadJob, 'schedule');

    const releaseStub = vi.spyOn(releaseRepository, 'getLatestRelease').mockResolvedValue(release);

    // when
    await uploadTranslationToPhrase({ Configuration: ConfigurationStub, LocalesApi: LocalesApiStub, UploadsApi: UploadsApiStub });

    // then
    expect(releaseStub).toHaveBeenCalledTimes(1);
    expect(exportTranslationsStub).toHaveBeenCalledTimes(1);
    expect(exportTranslationsStub).toHaveBeenCalledWith(
      expect.anything(),
      { areaCode: undefined, frameworkName: 'Pix' },
      {
        baseUrl: 'http://test.site',
        localizedChallengeRepository,
        release
      }
    );
    expect(uploadCreateStub).toHaveBeenCalledTimes(1);
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
    expect(scheduleStub).toHaveBeenCalledWith({ uploadId: 'upload-id', projectId: 'MY_PHRASE_PROJECT_ID' });
  });

  it('should multi upload to Phrase when the are several projectIds', async () => {
    // given
    const release = Symbol('release');
    const ConfigurationStub = class {};
    vi.spyOn(config.phrase, 'projects', 'get').mockReturnValue([
      { projectId: 'mon-projet-1' },
      { projectId: 'mon-projet-2', areaCode: '4' },
    ]);
    const localesListStub = vi.fn()
      .mockResolvedValueOnce([
        { id: 'frLocaleId-1', code: 'fr', name: 'fr', _default: true },
      ])
      .mockResolvedValueOnce([
        { id: 'frLocaleId-2', code: 'fr', name: 'fr', _default: true },
      ]);

    const LocalesApiStub = class {
      localesList() { return localesListStub(); }
    };
    const uploadCreateStub = vi.fn()
      .mockResolvedValue({ id: 'upload-id-1' })
      .mockResolvedValue({ id: 'upload-id-2' });

    const UploadsApiStub = class {
      uploadCreate(...args) { return uploadCreateStub(...args); }
    };

    const exportTranslationsStub = vi.spyOn(exportTranslationsUseCase, 'exportTranslations').mockImplementation((stream) => stream.end());
    vi.spyOn(deleteUnmentionedKeysAfterUploadJob, 'schedule');

    const releaseStub = vi.spyOn(releaseRepository, 'getLatestRelease').mockResolvedValue(release);

    // when
    await uploadTranslationToPhrase({ Configuration: ConfigurationStub, LocalesApi: LocalesApiStub, UploadsApi: UploadsApiStub });

    // then
    const expectedData = {
      file: expect.anything(),
      fileFormat: 'csv',
      updateDescriptions: true,
      updateTranslations: true,
      skipUploadTags: true,
      localeMapping: {
        fr: 2,
      },
      formatOptions: {
        key_index: 1,
        tag_column: 3,
        comment_index: 4,
        header_content_row: true,
      }
    };
    expect(releaseStub).toHaveBeenCalledTimes(1);
    expect(exportTranslationsStub).toHaveBeenCalledTimes(2);
    expect(exportTranslationsStub).toHaveBeenCalledWith(
      expect.anything(),
      { areaCode: undefined },
      {
        baseUrl: 'http://test.site',
        localizedChallengeRepository,
        release
      }
    );
    expect(exportTranslationsStub).toHaveBeenCalledWith(
      expect.anything(),
      { areaCode: '4' },
      {
        baseUrl: 'http://test.site',
        localizedChallengeRepository,
        release
      }
    );
    expect(uploadCreateStub).toHaveBeenCalledTimes(2);
    expect(uploadCreateStub).toHaveBeenNthCalledWith(1, { projectId: 'mon-projet-1', localeId: 'frLocaleId-1', ...expectedData });
    expect(uploadCreateStub).toHaveBeenNthCalledWith(2, { projectId: 'mon-projet-2', localeId: 'frLocaleId-2', ...expectedData });
  });

  it('should schedule multiple deletions of unmentioned keys when the are several projectIds', async () => {
    // given
    const ConfigurationStub = class {};
    vi.spyOn(config.phrase, 'projects', 'get').mockReturnValue([
      { projectId: 'mon-projet-1' },
      { projectId: 'mon-projet-2', areaCode: '4' },
    ]);
    const localesListStub = vi.fn()
      .mockResolvedValueOnce([
        { id: 'frLocaleId-1', code: 'fr', name: 'fr', _default: true },
      ])
      .mockResolvedValueOnce([
        { id: 'frLocaleId-2', code: 'fr', name: 'fr', _default: true },
      ]);

    const LocalesApiStub = class {
      localesList() { return localesListStub(); }
    };
    const uploadCreateStub = vi.fn()
      .mockResolvedValueOnce({ id: 'upload-id-1' })
      .mockResolvedValueOnce({ id: 'upload-id-2' });

    const UploadsApiStub = class {
      uploadCreate(...args) { return uploadCreateStub(...args); }
    };

    vi.spyOn(exportTranslationsUseCase, 'exportTranslations').mockImplementation((stream) => stream.end());
    const deleteUnmentionedKeysJobStub = vi.spyOn(deleteUnmentionedKeysAfterUploadJob, 'schedule');

    // when
    await uploadTranslationToPhrase({ Configuration: ConfigurationStub, LocalesApi: LocalesApiStub, UploadsApi: UploadsApiStub });

    // then
    expect(deleteUnmentionedKeysJobStub).toHaveBeenCalledTimes(2);
    expect(deleteUnmentionedKeysJobStub).toHaveBeenNthCalledWith(1, { uploadId: 'upload-id-1', projectId: 'mon-projet-1' });
    expect(deleteUnmentionedKeysJobStub).toHaveBeenNthCalledWith(2, { uploadId: 'upload-id-2', projectId: 'mon-projet-2' });
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
    vi.spyOn(config.phrase, 'projects', 'get').mockReturnValue([]);

    const ConfigurationStub = vi.fn();

    // when
    await uploadTranslationToPhrase({ Configuration: ConfigurationStub });

    // then
    expect(ConfigurationStub).not.toHaveBeenCalled();
  });
});
