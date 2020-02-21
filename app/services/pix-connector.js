import classic from 'ember-classic-decorator';
import Service from '@ember/service';
import fetch from 'fetch';
import { isNotFoundResponse } from 'ember-fetch/errors';
import { inject as service } from '@ember/service';

@classic
export default class PixConnectorService extends Service {
  @service
  config;

  tokens = false;
  connected = false;

  connect() {
    let config = this.get('config');
    let user = config.get('pixUser');
    let password = config.get('pixPassword');
    if (user && user.length>0 && password && password.length>0) {
      let credentialsData = new URLSearchParams({
        username:user,
        password:password,
        scope:'pix'
      });
      fetch(config.get('pixStaging')+'/api/token', {
        method:'POST',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body:credentialsData.toString()
      })
      .then(response => response.ok ? response.json():false)
      .then((response) => {
        if (response) {
          this.set('token', response.access_token);
          this.set('connected', true);
        } else {
          this.set('connected', false);
        }
      })
      .catch(() => {
        this.set('connected', false)
      });
    } else {
      this.set('connected', false);
    }
  }

  updateCache(challenge) {
    if (this.get('connected')) {
      let url = this.get('config').get('pixStaging')+'/api/cache/';
      let token = this.get('token');
      let problem = false;
      return fetch(url+'Epreuves_'+challenge.get('pixId'), {
        method:'DELETE',
        headers: {
          Authorization: 'Bearer '+token
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
