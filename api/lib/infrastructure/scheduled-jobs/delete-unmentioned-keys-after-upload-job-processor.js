import { RETRY, deleteUnmentionedKeysAfterUpload } from '../../domain/usecases/index.js';
import { schedule } from './delete-unmentioned-keys-after-upload-job.js';

export default async function deleteUnmentionedKeysAfterUploadJobProcessor(job) {
  const status = await deleteUnmentionedKeysAfterUpload(job.data.uploadId);

  if (status === RETRY) {
    schedule(job.data);
  }
}
