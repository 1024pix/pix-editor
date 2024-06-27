import axios from 'axios';
import * as config from '../../config.js';
import { fileStorageTokenRepository } from '../repositories/index.js';

export async function cloneAttachmentsFileInBucket({ attachments, millisecondsTimestamp }) {
  return _callAPIWithRetry(async (token) => {
    const fnc = async (attachment, variableCloneUrlPortion) => {
      const path = attachment.url.replace(config.pixEditor.storagePost, '');
      const cloneUrl = `${config.pixEditor.storagePost}${variableCloneUrlPortion}`;
      await axios.put(cloneUrl, null, {
        headers: {
          'X-Auth-Token': token,
          'X-Copy-From': `${config.pixEditor.storageBucket}/${path}`,
        },
      });
      attachment.url = cloneUrl;
    };
    const identicFilenamesCount = {};
    for (const attachment of attachments) {
      const filename = attachment.url.split('/').pop();
      if (!identicFilenamesCount[filename]) identicFilenamesCount[filename] = 0;
      ++identicFilenamesCount[filename];
      const variableCloneUrlPortion = `${millisecondsTimestamp}_${identicFilenamesCount[filename].toString().padStart(3, '0')}/${filename}`;
      await fnc(attachment, variableCloneUrlPortion);
    }
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
