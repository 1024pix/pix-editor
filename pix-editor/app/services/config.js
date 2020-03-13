import Service from '@ember/service';
import {configPrivate} from '../config-private';
import CryptoJS from 'crypto-js';
import {inject as service} from '@ember/service';
import { tracked } from '@glimmer/tracking';


export default class ConfigService extends Service {

  @service store;

  @tracked author;
  @tracked configKey;
  @tracked airtableKey;
  @tracked access;
  @tracked pixUser;
  @tracked pixPassword;
  @tracked access;
  @tracked pixUser;
  @tracked pixPassword;
  @tracked airtableBase;
  @tracked airtableEditorBase;
  @tracked airtableUrl;
  @tracked tableChallenges;
  @tracked tableSkills;
  @tracked tableTubes;
  @tracked storagePost;
  @tracked storageTenant;
  @tracked storageUser;
  @tracked storagePassword;
  @tracked storageKey;
  @tracked storageAuth;
  @tracked pixStaging;
  @tracked authors;
  @tracked authorNames;
  @tracked lite;
  @tracked loaded = false;
  @tracked decrypted = false;

  _localConfigKeys = ['airtableKey', 'configKey', 'author', 'access'];
  _localConfigKeysOptional = ['pixUser', 'pixPassword'];

  constructor() {
    super(...arguments);
    this.load();
    if (this.loaded) {
      this.decrypt();
    }
  }

  get check() {
    return this.loaded && this.decrypted;
  }

  load() {
    this.loaded = false;
    try {
      let localConfig = localStorage.getItem('pix-config');
      if (localConfig) {
        let incomplete = false;
        localConfig = JSON.parse(localConfig);
        this._localConfigKeys.forEach((key) => {
          if (typeof localConfig[key] == 'undefined') {
            incomplete = true;
          } else {
            this[key] = localConfig[key];
          }
        });
        this._localConfigKeysOptional.forEach((key) => {
          if (typeof localConfig[key] !== 'undefined') {
            this[key] = localConfig[key];
          }
        });
        if (incomplete) {
          throw 'local config incomplete';
        }
        this.loaded = true;
      } else {
        throw 'no local config';
      }
    }
    catch (error) {
      console.error(error);
      this.loaded = false;
    }
    return this.loaded;
  }

  decrypt() {
    this.decrypted = false;
    try {
      let key = this.configKey;
      let value = CryptoJS.AES.decrypt(configPrivate.encrypted, key);
      let encryptedConfig = JSON.parse(value.toString(CryptoJS.enc.Utf8));
      Object.keys(encryptedConfig).forEach((key) => {
        this[key] = encryptedConfig[key];
      });
      this.decrypted = true;
    } catch (error) {
      console.error(error);
      this.decrypted = false;
    }
    if (this.decrypted && this.airtableKey) {
      this.loadAuthors();
    }
    return this.decrypted;
  }

  save() {
    let localConfig = this._localConfigKeys.reduce((current, key) => {
      current[key] = this[key];
      return current;
    }, {});
    localConfig = this._localConfigKeysOptional.reduce((current, key) => {
      let value = this[key];
      if (value && typeof value !=='undefined' && (typeof value.length === 'undefined' || value.length>0)) {
        current[key] = value;
      }
      return current;
    }, localConfig);
    localStorage.setItem('pix-config', JSON.stringify(localConfig));
  }

  loadAuthors() {
    try {
      this.store.query('author', {sort:[{field: 'Nom', direction:'asc'}]})
      .then(authors => {
        this.authors = authors;
        this.authorNames = authors.reduce((current, value) => {
          current.push(value.name);
          return current;
        }, []);
      });
    } catch (e) {
      this.authors = null;
      this.authorNames = null;
    }
  }
}
