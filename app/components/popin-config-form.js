import PopinBase from "./popin-base";
import { computed } from '@ember/object';
import {inject as service} from '@ember/service';
import DS from "ember-data";

export default PopinBase.extend({
  config:service(),
  access:service(),
  saved:false,
  newAuthor:null,
  init() {
    this._super(...arguments);
    this.oldValues = {};
  },
  willInitSemantic(settings) {
    this._super(...arguments);
    let that = this;
    settings.onHidden = () => {
      that.send('onHidden');
    }
  },
  _setValue(key, value) {
    if (this.oldValues[key] == null) {
      this.oldValues[key] = this.get("config."+key);
    }
    this.set("config."+key, value);
    return value;
  },
  _restoreValue(key) {
    if (this.oldValues[key] != null) {
      this.set(key, this.oldValues[key]);
    }
  },
  airtableKey:computed("config.airtableKey", {
    get() {
      return this.get("config.airtableKey");
    },
    set(key, value) {
      return this._setValue("airtableKey", value);
    }
  }),
  configKey:computed("config.configKey", {
    get() {
      return this.get("config.configKey");
    },
    set(key, value) {
      return this._setValue("configKey", value);
    }
  }),
  author:computed("config.author", {
    get() {
      return this.get("config.author");
    },
    set(key, value) {
      return this._setValue("author", value);
    }
  }),
  pixUser:computed("config.pixUser", {
    get() {
      return this.get("config.pixUser");
    },
    set(key, value) {
      return this._setValue("pixUser", value);
    }
  }),
  pixPassword:computed("config.pixPassword", {
    get() {
      return this.get("config.pixPassword");
    },
    set(key, value) {
      return this._setValue("pixPassword", value);
    }
  }),
  authors:computed("config.{decrypted,authors}", function() {
    if (this.get("config.decrypted")) {
      return DS.PromiseArray.create({
        promise:this.get("config.authors")
      })
    } else {
      return [];
    }
  }),
  didInsertElement() {
    // fix a bug with semantic ui accordion that is not correctly
    // initialized in popin
    this.$('.ui.accordion').accordion();
  },
  actions:{
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
        this.execute("hide");
      });
    },
    onHidden() {
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
    }
  }
});
