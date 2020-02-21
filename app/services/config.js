import classic from 'ember-classic-decorator';
import { computed } from '@ember/object';
import Service from '@ember/service';
import {configPrivate} from '../config-private';
import CryptoJS from 'crypto-js';
import {inject as service} from '@ember/service';

@classic
export default class ConfigService extends Service {
  @service
  store;

  loaded = false;
  author = '';

  init() {
    super.init(...arguments);
    this.localConfigKeys = ['airtableKey', 'configKey', 'author', 'access'];
    this.localConfigKeysOptional = ['pixUser', 'pixPassword'];
    this._load();
  }

  @computed('configKey')
  get decrypted() {
    return this._decrypt();
  }

  @computed('decrypted')
  get check() {
    return this.loaded && this.get('decrypted');
  }

  @computed('airtableKey', 'decrypted', 'airtableEditorBase')
  get authors() {
    if (this.get('airtableKey') && this.get('airtableEditorBase')) {
      try {
        return this.get('store').query('author', {sort:[{field: 'Nom', direction:'asc'}]});
      }
      catch(e) {
        return Promise.resolve([]);
      }
    }
    return Promise.resolve([]);
  }

  @computed('authors')
  get authorNames() {
    return this.get('authors').
      then(authors => {
        return authors.reduce((current, value) => {
          current.push(value.get('name'));
            return current;
        }, []);
      });
  }

  _load() {
    try {
      let localConfig = localStorage.getItem('pix-config');
      if (localConfig) {
        let incomplete = false;
        localConfig = JSON.parse(localConfig);
        this.localConfigKeys.forEach((key) => {
          if (typeof localConfig[key] == 'undefined') {
            incomplete = true;
          } else {
            this.set(key, localConfig[key]);
          }
        });
        this.localConfigKeysOptional.forEach((key) => {
          if (typeof localConfig[key] !== 'undefined') {
            this.set(key, localConfig[key]);
          }
        });
        if (incomplete) {
          throw 'local config incomplete';
        }
      } else {
        throw 'no local config';
      }
    }
    catch (error) {
      console.error(error);
      this.set('loaded', false);
    }
    this.set('loaded', true);
  }

  _decrypt() {
    try {
      let key = this.get('configKey');
      let value = CryptoJS.AES.decrypt(configPrivate.encrypted, key);
      let encryptedConfig = JSON.parse(value.toString(CryptoJS.enc.Utf8));
      Object.keys(encryptedConfig).forEach((key) => {
        this.set(key, encryptedConfig[key]);
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  save() {
    let localConfig = this.localConfigKeys.reduce((current, key) => {
      current[key] = this.get(key);
      return current;
    }, {});
    localConfig = this.localConfigKeysOptional.reduce((current, key) => {
      let value = this.get(key);
      if (value && typeof value !=='undefined' && (typeof value.length === 'undefined' || value.length>0)) {
        current[key] = value;
      }
      return current;
    }, localConfig);
    localStorage.setItem('pix-config', JSON.stringify(localConfig));
  }
}
