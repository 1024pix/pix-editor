import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import Sentry from '@sentry/ember';
import sha256 from 'crypto-js/sha256';

export default class StorageService extends Service {

  @service config;
  @service filePath;
  @service auth;

  async uploadFile({ file, filename, date = Date, isAttachment = false, hash = false }) {
    filename = filename || file.name;
    const finalName = hash ? this._hashFileName(filename) : filename;
    const url = this.config.storagePost + date.now() + '/' + encodeURIComponent(finalName);
    return this._callAPIWithRetry(async (token) => {
      const headers = {
        'X-Auth-Token': token,
        'Content-Type': file.type,
      };
      if (isAttachment) {
        headers['Content-Disposition'] = this._getContentDispositionHeader(filename);
      }
      await file.uploadBinary(url, {
        method: 'PUT',
        headers,
      });

      return {
        url,
        filename,
        size: file.size,
        type: file.type,
      };
    });
  }

  _getContentDispositionHeader(filename) {
    return `attachment; filename="${encodeURIComponent(filename)}"`;
  }

  _hashFileName(filename) {
    const pos = filename.lastIndexOf('.');
    const extension = filename.substr(pos);
    const name = filename.substr(0,pos);
    const hash = sha256(name).toString().substring(0,10);
    return hash + extension;
  }

  async cloneFile(url, date = Date, fetchFn = fetch) {
    const path = url.replace(this.config.storagePost, '');
    const filename = url.split('/').reverse()[0];
    const cloneUrl = `${this.config.storagePost}${date.now()}/${filename}`;
    return this._callAPIWithRetry(async (token) => {
      await fetchFn(cloneUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': token,
          'X-Copy-From': `${this.config.storageBucket}/${path}`,
        },
      });

      return cloneUrl;
    });
  }

  async _callAPIWithRetry(fn, renewToken = false) {
    const token = await this.getStorageToken(renewToken);
    try {
      return await fn(token);
    } catch (error) {
      if (error.response && error.response.status === 401 && !renewToken) {
        return this._callAPIWithRetry(fn, true);
      } else {
        throw error;
      }
    }
  }

  async getStorageToken(renew, fetchFn = fetch) {
    try {
      const config = this.config;
      if (!renew && this._hasStorageToken()) {
        return config.storageToken;
      }
      const response = await fetchFn('/api/file-storage-token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.auth.key}` }
      });
      if (!response.ok) {
        console.error('could not get storage token');
        return false;
      }
      const json = await response.json();
      config.storageToken = json.token;
      return config.storageToken;
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      return false;
    }
  }

  _hasStorageToken() {
    return typeof this.config.storageToken !== 'undefined';
  }

  async renameFile(url, filename, fetchFn = fetch) {
    return this._callAPIWithRetry(async (token) => {
      await fetchFn(url, {
        method: 'POST',
        headers: {
          'X-Auth-Token': token,
          'Content-Disposition': this._getContentDispositionHeader(filename),
        },
      });
    });
  }
}
