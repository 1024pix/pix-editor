import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import Sentry from '@sentry/ember';

export default class StorageService extends Service {

  @service config;
  @service filePath;

  async uploadFile({ file, filename, date = Date, isAttachment = false }) {
    filename = filename || file.name;
    const url = this.config.storagePost + date.now() +  '.' + this.filePath.getExtension(file.name);
    return this._callAPIWithRetry(async (token) => {
      const headers = {
        'X-Auth-Token': token,
        'Content-Type': file.type,
      };
      if (isAttachment) {
        headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(filename)}"`;
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

  async cloneFile(url, date = Date, fetchFn = fetch) {
    const filename = url.split('/').reverse()[0];
    const cloneUrl = `${this.config.storagePost}${date.now()}.${this.filePath.getExtension(filename)}`;
    return this._callAPIWithRetry(async (token) => {
      await fetchFn(cloneUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': token,
          'X-Copy-From': `${this.config.storageBucket}/${filename}`,
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
      if (error.response.status === 401 && !renewToken) {
        return this._callAPIWithRetry(fn, true);
      } else {
        throw error;
      }
    }
  }

  uploadFiles(files) {
    const requests = files.map(file => this.uploadFile(file));
    return Promise.all(requests);
  }

  getStorageToken(renew) {
    const config = this.config;
    if (!renew && typeof config.storageToken !== 'undefined') {
      return Promise.resolve(config.storageToken);
    } else {
      var data = {
        'auth': {
          'identity': {
            'methods': ['password'],
            'password': {
              'user': {
                'name': config.storageUser,
                'domain': { 'id': 'default' },
                'password': config.storagePassword
              }
            }
          },
          'scope': {
            'project': {
              'name': config.storageTenant,
              'domain': { 'id': 'default' }
            }
          }
        }
      };
      return fetch(config.storageAuth, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(response => response.ok ? response.json() : false)
        .then(response => {
          if (response) {
            config.storageToken = response.token;
            return config.storageToken;
          } else {
            console.error('could not get storage token');
            return false;
          }
        })
        .catch((error) => {
          console.error(error);
          Sentry.captureException(error);
        });
    }
  }
}
