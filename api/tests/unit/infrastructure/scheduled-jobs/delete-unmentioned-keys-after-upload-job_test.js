import { describe, expect, it, vi } from 'vitest';
import * as deleteUnmentionedKeysAfterUploadJob from '../../../../lib/infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job.js';
import deleteUnmentionedKeysAfterUploadJobProcessor from '../../../../lib/infrastructure/scheduled-jobs/delete-unmentioned-keys-after-upload-job-processor.js';
import * as deleteUnmentionedKeysAfterUploadUsecase from '../../../../lib/domain/usecases/delete-unmentioned-keys-after-upload.js';

describe('Unit | Infrastructure | scheduled-jobs | delete-unmentioned-keys-after-upload-job', function() {
  it('should schedule a new job when delete-unmentioned-keys-after-upload return status is `retry`', async function() {
    // given
    const deleteUnmentionedKeysAfterUploadStub = vi.spyOn(deleteUnmentionedKeysAfterUploadUsecase, 'deleteUnmentionedKeysAfterUpload').mockResolvedValue(deleteUnmentionedKeysAfterUploadUsecase.RETRY);
    const scheduleStub = vi.spyOn(deleteUnmentionedKeysAfterUploadJob, 'schedule');

    // when
    await deleteUnmentionedKeysAfterUploadJobProcessor({ data: { uploadId: 'upload-id' } });

    // then
    expect(scheduleStub).toHaveBeenCalledWith({ uploadId: 'upload-id' });
    expect(deleteUnmentionedKeysAfterUploadStub).toHaveBeenCalledWith('upload-id');
  });

  it('should not schedule a new job when delete-unmentioned-keys-after-upload return status is `completed`', async function() {
    // given
    const deleteUnmentionedKeysAfterUploadStub = vi.spyOn(deleteUnmentionedKeysAfterUploadUsecase, 'deleteUnmentionedKeysAfterUpload').mockResolvedValue(deleteUnmentionedKeysAfterUploadUsecase.COMPLETED);
    const scheduleStub = vi.spyOn(deleteUnmentionedKeysAfterUploadJob, 'schedule');

    // when
    await deleteUnmentionedKeysAfterUploadJobProcessor({ data: { uploadId: 'upload-id' } });

    // then
    expect(scheduleStub).not.toHaveBeenCalled();
    expect(deleteUnmentionedKeysAfterUploadStub).toHaveBeenCalledWith('upload-id');
  });
});
