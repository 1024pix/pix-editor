import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';
import Sentry from '@sentry/ember';

export default class StorageService extends Service {

  @service config;
  @service filePath;

  uploadFile(file, fileName) {
    const url = this.config.storagePost + Date.now() +  '.' + this.filePath.getExtension(file.name);
    const that = this;
    return this.getStorageToken()
      .then(function(token) {
        return file.uploadBinary(url, { method:'put', headers:{ 'X-Auth-Token': token } })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              // token expired: get a new one
              return that.getStorageToken(true)
                .then(function(token) {
                  return file.uploadBinary(url, { method:'PUT', headers:{ 'X-Auth-Token': token } });
                });
            } else {
              return Promise.reject(error);
            }
          });
      })
      .then(function() {
        return {
          url,
          filename: fileName || file.name,
          size: file.size,
          type: file.type
        };
      });
  }

  uploadFiles(files) {
    var requests = [];
    for (var i = 0; i < files.length;i++) {
      requests.push(this.uploadFile(files[i]));
    }
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
        method:'POST',
        headers:{ 'Content-type': 'application/json' },
        body:JSON.stringify(data)
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
