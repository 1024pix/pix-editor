import './job-process.js';
import { RETRY, deleteUnmentionedKeysAfterUpload } from '../../domain/usecases/index.js';
import { schedule } from './delete-unmentioned-keys-after-upload-job.js';

export default async function deleteUnmentionedKeysAfterUploadJobProcessor(job) {
  const status = await deleteUnmentionedKeysAfterUpload({
    uploadId: job.data.uploadId,
    projectId: job.data.projectId,
  });

  if (status === RETRY) {
    await schedule(job.data);
  }
}
