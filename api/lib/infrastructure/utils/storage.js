import axios from 'axios';
import * as config from '../../config.js';
import { fileStorageTokenRepository } from '../repositories/index.js';

export async function cloneFiles({ urls, millisecondsTimestamp }) {
  return _callAPIWithRetry(async (token) => {
    const fnc = async (url) => {
      const path = url.replace(config.pixEditor.storagePost, '');
      const filename = url.split('/').pop();
      const cloneUrl = `${config.pixEditor.storagePost}${millisecondsTimestamp}/${filename}`;
      await axios.put(cloneUrl, null, {
        headers: {
          'X-Auth-Token': token,
          'X-Copy-From': `${config.pixEditor.storageBucket}/${path}`,
        },
      });
      return cloneUrl;
    };
    return Promise.all(urls.map((url) => fnc(url)));
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
