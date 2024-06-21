import axios from 'axios';
import * as config from '../../config.js';
import { fileStorageTokenRepository } from '../repositories/index.js';

// todo fix timestamp bug on batch creation
export async function cloneAttachmentsFileInBucket({ attachments, millisecondsTimestamp }) {
  return _callAPIWithRetry(async (token) => {
    const fnc = async (attachment) => {
      const path = attachment.url.replace(config.pixEditor.storagePost, '');
      const filename = attachment.url.split('/').pop();
      const cloneUrl = `${config.pixEditor.storagePost}${millisecondsTimestamp}/${filename}`;
      await axios.put(cloneUrl, null, {
        headers: {
          'X-Auth-Token': token,
          'X-Copy-From': `${config.pixEditor.storageBucket}/${path}`,
        },
      });
      attachment.url = cloneUrl;
    };
    return Promise.all(attachments.map((attachment) => fnc(attachment)));
  });
}

async function _callAPIWithRetry(fn) {
  const { value: token } = await fileStorageTokenRepository.create();
  try {
    return await fn(token);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return _callAPIWithRetry(fn);
    } else {
      throw error;
    }
  }
}
