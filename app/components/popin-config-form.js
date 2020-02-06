import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import DS from "ember-data";

@classic
export default class PopinConfigForm extends Component {
  @service
  config;

  @service
  access;

  saved = false;
  newAuthor = null;

  init() {
    super.init(...arguments);
    this.oldValues = {};
  }

  _setValue(key, value) {
    if (this.oldValues[key] == null) {
      this.oldValues[key] = this.get("config."+key);
    }
    this.set("config."+key, value);
    return value;
  }

  _restoreValue(key) {
    if (this.oldValues[key] != null) {
      this.set(key, this.oldValues[key]);
    }
  }

  @computed("config.airtableKey")
  get airtableKey() {
    return this.get("config.airtableKey");
  }

  set airtableKey(value) {
    return this._setValue("airtableKey", value);
  }

  @computed("config.configKey")
  get configKey() {
    return this.get("config.configKey");
  }

  set configKey(value) {
    return this._setValue("configKey", value);
  }

  @computed("config.author")
  get author() {
    return this.get("config.author");
  }

  set author(value) {
    return this._setValue("author", value);
  }

  @computed("config.pixUser")
  get pixUser() {
    return this.get("config.pixUser");
  }

  set pixUser(value) {
    return this._setValue("pixUser", value);
  }

  @computed("config.pixPassword")
  get pixPassword() {
    return this.get("config.pixPassword");
  }

  set pixPassword(value) {
    return this._setValue("pixPassword", value);
  }

  @computed("config.{decrypted,authors}")
  get authors() {
    if (this.get("config.decrypted")) {
      return DS.PromiseArray.create({
        promise:this.get("config.authors")
      })
    } else {
      return [];
    }
  }

  @computed("config.{decrypted,authorNames}")
  get authorNames() {
    if (this.get("config.decrypted")) {
      return DS.PromiseArray.create({
        promise:this.get("config.authorNames")
      })
    } else {
      return [];
    }
  }

  _closeModal() {
    if (this.get("saved")) {
      this.get("update")();
    } else {
      this._restoreValue("airtableKey");
      this._restoreValue("configKey");
      this._restoreValue("author");
      this._restoreValue("pixUser");
      this._restoreValue("pixPassword");
    }
    this.oldValues = {};
    this.set('display', false);
  }

  @action
  saveConfig() {
    let config = this.get("config");
    let author = this.get("author");
    let access = this.get("access");
    let accessLevel = access.get("readOnly");
    this.get("authors").then(authors => {
      let authorRecord = authors.find((value) => {
        return value.get("name") === author;
      });
      if (authorRecord) {
        accessLevel = access.getLevel(authorRecord.get("access"));
      }
      config.set("access", accessLevel);
      config.save();
      this.set("saved", true);
      this._closeModal();
    });
  }

  @action
  closeModal() {
    this._closeModal();
  }
}
