import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PopinConfigForm extends Component {
  @service config;

  @service access;

  @tracked saved = false;

  oldValues = {};

  _setValue(key, value) {
    if (this.oldValues[key] == null) {
      this.oldValues[key] = this.config[key];
    }
    this.config[key] = value;
    return value;
  }

  _restoreValue(key) {
    if (this.oldValues[key] != null) {
      this.config[key] = this.oldValues[key];
    }
  }

  get airtableKey() {
    return this.config.airtableKey;
  }

  set airtableKey(value) {
    this._setValue('airtableKey', value);
    if (this.config.decrypted) {
      this.config.loadAuthors();
    }
    return value;
  }

  get configKey() {
    return this.config.configKey;
  }

  set configKey(value) {
    this._setValue('configKey', value);
    this.config.decrypt();
    return value;
  }

  get author() {
    return this.config.author;
  }

  set author(value) {
    return this._setValue('author', value);
  }

  get pixUser() {
    return this.config.pixUser;
  }

  set pixUser(value) {
    return this._setValue('pixUser', value);
  }

  get pixPassword() {
    return this.config.pixPassword;
  }

  set pixPassword(value) {
    return this._setValue('pixPassword', value);
  }

  get authors() {
    return this.config.authors;
  }

  get authorNames() {
    return this.config.authorNames;
  }

  _closeModal() {
    this.args.close();
    if (!this.saved) {
      this._restoreValue('airtableKey');
      this._restoreValue('configKey');
      this._restoreValue('author');
      this._restoreValue('pixUser');
      this._restoreValue('pixPassword');
      this.oldValues = {};
    } else {
      this.oldValues = {};
      this.args.update();
    }
  }

  @action
  saveConfig() {
    const config = this.config;
    const author = this.author;
    const access = this.access;
    let accessLevel = access.readOnly;
    const authors = this.authors;
    const authorRecord = authors.find((value) => {
      return value.name === author;
    });
    if (authorRecord) {
      accessLevel = access.getLevel(authorRecord.access);
    }
    config.access = accessLevel;
    config.save();
    this.saved = true;
    this._closeModal();
  }

  @action
  closeModal() {
    this._closeModal();
  }
}
