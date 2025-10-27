import { Configuration, UploadsApi, KeysApi } from 'phrase-js';
import * as config from '../../config.js';
import { logger } from '../../infrastructure/logger.js';

export const RETRY = Symbol('retry');
export const COMPLETED = Symbol('completed');
export const MISSING_ARGUMENTS = Symbol('missing arguments');

export async function deleteUnmentionedKeysAfterUpload({ projectId, uploadId }) {
  if (!projectId || !uploadId) {
    logger.warn('ProjectId or UploadId is not defined !');
    return MISSING_ARGUMENTS;
  }
  const { apiKey } = config.phrase;

  const configuration = new Configuration({
    fetchApi: fetch,
    apiKey: `token ${apiKey}`,
  });
  const upload = await new UploadsApi(configuration).uploadShow({
    projectId,
    id: uploadId,
  });

  if (upload.state === 'processing') {
    return RETRY;
  }
  if (upload.state !== 'success' || upload.summary.translationKeysUnmentioned === 0) {
    return COMPLETED;
  }

  await new KeysApi(configuration).keysDeleteCollection({
    projectId,
    q: `unmentioned_in_upload:${uploadId}`,
  });

  return COMPLETED;
}
