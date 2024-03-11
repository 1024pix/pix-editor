import { describe, expect, it, vi } from 'vitest';
import uploadTranslationJobProcessor from '../../../../lib/infrastructure/scheduled-jobs/upload-translation-job-processor.js';
import * as uploadTranslationToPhraseUseCase from '../../../../lib/domain/usecases/upload-translation-to-phrase.js';

describe('Unit | Infrastructure | scheduled-jobs | upload-translation-job-job', function() {
  it('should call the usecase', async function() {
    // given
    const uploadTranslationToPhraseStub = vi.spyOn(uploadTranslationToPhraseUseCase, 'uploadTranslationToPhrase').mockResolvedValue();

    // when
    await uploadTranslationJobProcessor();

    // then
    expect(uploadTranslationToPhraseStub).toHaveBeenCalledOnce();
  });
});
