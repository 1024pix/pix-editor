import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadTranslationsToWeblate } from '../../../../lib/domain/usecases/upload-translations-to-weblate.js';
import * as config from '../../../../lib/config.js';
import { domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Usecases | upload-translation-to-weblate', () => {
  const release = Symbol('release');

  let translationsConfigRepository, releaseRepository, exportTranslationsForWeblate, fetch;

  beforeEach(() => {
    translationsConfigRepository = { listWithWeblateComponent: vi.fn() };
    releaseRepository = { getLatestRelease: vi.fn().mockResolvedValue(release) };
    exportTranslationsForWeblate = vi.fn();
    fetch = vi.fn().mockResolvedValueOnce(new Response(null, { status: 200 }));
  });

  it('should upload to Weblate', async () => {
    // given
    translationsConfigRepository.listWithWeblateComponent.mockResolvedValueOnce([
      domainBuilder.buildTranslationsConfig({
        frameworkId: 'frameworkPix',
        areaId: null,
        weblateComponent: 'weblateComponent',
        uploadedLocales: ['fr'],
      }),
    ]);

    exportTranslationsForWeblate.mockImplementationOnce(({ stream }) => stream.end());

    // when
    await uploadTranslationsToWeblate({ translationsConfigRepository, releaseRepository, exportTranslationsForWeblate, fetch });

    // then
    expect(translationsConfigRepository.listWithWeblateComponent).toHaveBeenCalledExactlyOnceWith();
    expect(releaseRepository.getLatestRelease).toHaveBeenCalledExactlyOnceWith();

    expect(exportTranslationsForWeblate).toHaveBeenCalledExactlyOnceWith(
      {
        stream: expect.anything(),
        frameworkId: 'frameworkPix',
        areaId: null,
        locale: 'fr',
        release,
      },
    );

    expect(fetch).toHaveBeenCalledExactlyOnceWith(new URL('https://test.weblate.pix.digital/api/translations/test-pix-editor/weblateComponent/fr/file/'), {
      method: 'POST',
      headers: { Authorization: 'token TEST_WEBLATE_TOKEN' },
      body: expect.any(FormData),
    });
  });

  describe('when no Weblate API token is defined', () => {
    it('does not upload to Weblate', async () => {
      // given
      vi.spyOn(config.weblate, 'apiToken', 'get').mockReturnValue(undefined);

      // when
      await uploadTranslationsToWeblate({ translationsConfigRepository, releaseRepository, exportTranslationsForWeblate, fetch });

      // then
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('when no translations configs with Weblate component are defined', () => {
    it('does not upload to Weblate', async () => {
      // given
      translationsConfigRepository.listWithWeblateComponent.mockResolvedValueOnce([]);

      // when
      await uploadTranslationsToWeblate({ translationsConfigRepository, releaseRepository, exportTranslationsForWeblate, fetch });

      // then
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
