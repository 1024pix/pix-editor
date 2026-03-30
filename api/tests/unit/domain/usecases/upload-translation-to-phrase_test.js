import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as exportTranslationsUsecase from '../../../../lib/domain/usecases/export-translations.js';
import { uploadTranslationToPhrase } from '../../../../lib/domain/usecases/upload-translation-to-phrase.js';
import { localizedChallengeRepository, releaseRepository, translationsConfigRepository } from '../../../../lib/infrastructure/repositories/index.js';
import * as deleteUnmentionedKeysAfterUploadJob from '../../../../lib/infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job.js';
import * as config from '../../../../lib/config.js';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Usecases | upload-translation-to-phrase', () => {
  const release = Symbol('release');

  let phraseApi, localesListStub, uploadCreateStub;
  let listTranslationsConfigStub, getLatestReleaseStub, exportTranslationsStub, scheduleDeleteUnmentionedStub;

  beforeEach(() => {
    localesListStub = vi.fn();
    uploadCreateStub = vi.fn();

    phraseApi = {
      Configuration: vi.fn(class { }),
      LocalesApi: vi.fn(class {
        localesList = localesListStub;
      }),
      UploadsApi: vi.fn(class {
        uploadCreate = uploadCreateStub;
      }),
    };

    listTranslationsConfigStub = vi.spyOn(translationsConfigRepository, 'list');
    getLatestReleaseStub = vi.spyOn(releaseRepository, 'getLatestRelease').mockResolvedValue(release);
    exportTranslationsStub = vi.spyOn(exportTranslationsUsecase, 'exportTranslations');
    scheduleDeleteUnmentionedStub = vi.spyOn(deleteUnmentionedKeysAfterUploadJob, 'schedule');
  });

  it('should upload to Phrase', async () => {
    // given
    listTranslationsConfigStub.mockResolvedValueOnce([
      domainBuilder.buildTranslationsConfig({
        phraseProjectId: 'MY_PHRASE_PROJECT_ID',
        frameworkId: 'frameworkPix',
        areaId: null,
        uploadedLocales: ['fr'],
      }),
    ]);

    localesListStub.mockResolvedValueOnce([{ id: 'frLocaleId', code: 'fr', name: 'fr' }]);
    uploadCreateStub.mockResolvedValueOnce({ id: 'upload-id' });

    exportTranslationsStub.mockImplementationOnce((stream) => stream.end());

    // when
    await uploadTranslationToPhrase(phraseApi);

    // then
    expect(phraseApi.Configuration).toHaveBeenCalledExactlyOnceWith({
      apiKey: 'token MY_PHRASE_ACCESS_TOKEN',
      fetchApi: fetch,
    });
    expect(phraseApi.LocalesApi).toHaveBeenCalledExactlyOnceWith(expect.any(phraseApi.Configuration));
    expect(phraseApi.UploadsApi).toHaveBeenCalledExactlyOnceWith(expect.any(phraseApi.Configuration));

    expect(listTranslationsConfigStub).toHaveBeenCalledExactlyOnceWith();
    expect(getLatestReleaseStub).toHaveBeenCalledExactlyOnceWith();

    expect(exportTranslationsStub).toHaveBeenCalledExactlyOnceWith(
      expect.anything(),
      {
        frameworkId: 'frameworkPix',
        areaId: null,
        locales: ['fr'],
      },
      {
        baseUrl: 'http://test.site',
        localizedChallengeRepository,
        release,
      },
    );

    expect(uploadCreateStub).toHaveBeenCalledExactlyOnceWith({
      projectId: 'MY_PHRASE_PROJECT_ID',
      localeId: 'frLocaleId',
      file: expect.any(File),
      fileFormat: 'csv',
      updateDescriptions: true,
      updateTranslations: true,
      skipUploadTags: true,
      localeMapping: { fr: 2 },
      formatOptions: {
        key_index: 1,
        tag_column: 3,
        comment_index: 4,
        header_content_row: true,
      },
    });

    expect(scheduleDeleteUnmentionedStub).toHaveBeenCalledExactlyOnceWith({ uploadId: 'upload-id', projectId: 'MY_PHRASE_PROJECT_ID' });
  });

  it('should multi upload to Phrase when the are several projectIds', async () => {
    // given
    listTranslationsConfigStub.mockResolvedValueOnce([
      domainBuilder.buildTranslationsConfig({
        phraseProjectId: 'mon-projet-1',
        frameworkId: 'frameworkPix',
        areaId: 'area1',
        uploadedLocales: ['fr'],
      }),
      domainBuilder.buildTranslationsConfig({
        phraseProjectId: 'mon-projet-2',
        frameworkId: 'frameworkPixEdu',
        areaId: null,
        uploadedLocales: ['fr', 'fr-FR'],
      }),
    ]);

    localesListStub
      .mockResolvedValueOnce([{ id: 'frLocaleId-1', code: 'fr', name: 'fr' }])
      .mockResolvedValueOnce([{ id: 'frLocaleId-2', code: 'fr', name: 'fr' }, { id: 'frFRLocaleId', code: 'fr', name: 'fr-FR' }]);

    uploadCreateStub
      .mockResolvedValueOnce({ id: 'upload-id-1' })
      .mockResolvedValueOnce({ id: 'upload-id-2' });

    exportTranslationsStub.mockImplementation((stream) => stream.end());

    // when
    await uploadTranslationToPhrase(phraseApi);

    // then
    expect(phraseApi.Configuration).toHaveBeenCalledExactlyOnceWith({
      apiKey: 'token MY_PHRASE_ACCESS_TOKEN',
      fetchApi: fetch,
    });
    expect(phraseApi.LocalesApi).toHaveBeenCalledExactlyOnceWith(expect.any(phraseApi.Configuration));
    expect(phraseApi.UploadsApi).toHaveBeenCalledExactlyOnceWith(expect.any(phraseApi.Configuration));

    expect(listTranslationsConfigStub).toHaveBeenCalledExactlyOnceWith();
    expect(getLatestReleaseStub).toHaveBeenCalledExactlyOnceWith();

    expect(exportTranslationsStub).toHaveBeenCalledTimes(2);
    expect(exportTranslationsStub).toHaveBeenCalledWith(
      expect.anything(),
      {
        frameworkId: 'frameworkPix',
        areaId: 'area1',
        locales: ['fr'],
      },
      {
        baseUrl: 'http://test.site',
        localizedChallengeRepository,
        release,
      },
    );
    expect(exportTranslationsStub).toHaveBeenCalledWith(
      expect.anything(),
      {
        frameworkId: 'frameworkPixEdu',
        areaId: null,
        locales: ['fr', 'fr-FR'],
      },
      {
        baseUrl: 'http://test.site',
        localizedChallengeRepository,
        release,
      },
    );

    expect(uploadCreateStub).toHaveBeenCalledTimes(2);
    expect(uploadCreateStub).toHaveBeenNthCalledWith(1, {
      projectId: 'mon-projet-1',
      localeId: 'frLocaleId-1',
      file: expect.any(File),
      fileFormat: 'csv',
      updateDescriptions: true,
      updateTranslations: true,
      skipUploadTags: true,
      localeMapping: { fr: 2 },
      formatOptions: {
        key_index: 1,
        tag_column: 3,
        comment_index: 4,
        header_content_row: true,
      },
    });
    expect(uploadCreateStub).toHaveBeenNthCalledWith(2, {
      projectId: 'mon-projet-2',
      localeId: 'frLocaleId-2',
      file: expect.any(File),
      fileFormat: 'csv',
      updateDescriptions: true,
      updateTranslations: true,
      skipUploadTags: true,
      localeMapping: { fr: 2, 'fr-FR': 3 },
      formatOptions: {
        key_index: 1,
        tag_column: 4,
        comment_index: 5,
        header_content_row: true,
      },
    });

    expect(scheduleDeleteUnmentionedStub).toHaveBeenCalledTimes(2);
    expect(scheduleDeleteUnmentionedStub).toHaveBeenNthCalledWith(1, { uploadId: 'upload-id-1', projectId: 'mon-projet-1' });
    expect(scheduleDeleteUnmentionedStub).toHaveBeenNthCalledWith(2, { uploadId: 'upload-id-2', projectId: 'mon-projet-2' });
  });

  describe('when no Phrase API key is defined', () => {
    it('does not upload to Phrase', async () => {
      // given
      vi.spyOn(config.phrase, 'apiKey', 'get').mockReturnValue(undefined);
      const ConfigurationStub = vi.fn();

      // when
      await uploadTranslationToPhrase({ Configuration: ConfigurationStub });

      // then
      expect(ConfigurationStub).not.toHaveBeenCalled();
    });
  });

  describe('when no translations configs are defined', () => {
    it('oes not upload to Phrase', async () => {
      // given
      const ConfigurationStub = vi.fn();

      // when
      await uploadTranslationToPhrase({ Configuration: ConfigurationStub });

      // then
      expect(ConfigurationStub).not.toHaveBeenCalled();
    });
  });
});
