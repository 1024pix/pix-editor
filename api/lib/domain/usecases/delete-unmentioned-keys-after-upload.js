import { Configuration, UploadsApi, KeysApi } from 'phrase-js';
import * as config from '../../config.js';

export const RETRY = Symbol('retry');
export const COMPLETED = Symbol('completed');

export async function deleteUnmentionedKeysAfterUpload(uploadId) {
  const { apiKey, projectId } = config.phrase;
  const configuration = new Configuration({
    fetchApi: fetch,
    apiKey: `token ${apiKey}`,
  });

  const upload = await new UploadsApi(configuration).uploadShow({ projectId, id: uploadId });

  if (upload.state === 'processing') {
    return RETRY;
  }
  if (upload.state !== 'success' ||
      upload.summary.translationKeysUnmentioned === 0) {
    return COMPLETED;
  }

  await new KeysApi(configuration).keysDeleteCollection({ projectId, q: `unmentioned_in_upload:${uploadId}` });

  return COMPLETED;
}
