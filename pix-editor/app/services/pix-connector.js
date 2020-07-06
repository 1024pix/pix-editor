import Service from '@ember/service';
import fetch from 'fetch';
import { isNotFoundResponse } from 'ember-fetch/errors';
import { inject as service } from '@ember/service';

export default class PixConnectorService extends Service {
  @service config;

  tokens = false;
  connected = false;

  connect() {
    const config = this.config;
    const user = config.pixUser;
    const password = config.pixPassword;
    if (user && user.length > 0 && password && password.length > 0) {
      const credentialsData = new URLSearchParams({
        username:user,
        password:password,
        scope:'pix'
      });
      fetch(config.pixStaging + '/api/token', {
        method:'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body:credentialsData.toString()
      })
        .then(response => response.ok ? response.json() : false)
        .then((response) => {
          if (response) {
            this.set('token', response.access_token);
            this.set('connected', true);
          } else {
            this.set('connected', false);
          }
        })
        .catch(() => {
          this.set('connected', false);
        });
    } else {
      this.set('connected', false);
    }
  }

  updateCache(challenge) {
    if (this.connected) {
      const url = this.config.pixStaging + '/api/cache/';
      const token = this.token;
      let problem = false;
      return fetch(url + 'Epreuves_' + challenge.pixId, {
        method:'DELETE',
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
        .then((response) => {
          if (!response.ok && !isNotFoundResponse(response)) {
            problem = true;
          }
        })
        .catch((error) => {
          if (error.status !== 404) {
            problem = true;
          }
        })
        .finally(() => {
          if (problem) {
            return Promise.reject();
          }
          return true;
        });
    } else {
      return Promise.reject();
    }
  }
}
