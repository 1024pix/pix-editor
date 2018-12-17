import Service from '@ember/service';
import {configPrivate} from "../config-private";
import CryptoJS from "crypto-js";
import {computed} from "@ember/object";
import {inject as service} from '@ember/service';

export default Service.extend({
  store:service(),
  init() {
    this._super(...arguments);
    this.localConfigKeys = ["airtableKey", "configKey", "author", "access"];
    this.localConfigKeysOptional = ["pixUser", "pixPassword"];
  },
  check() {
    let localConfigCorrectlyLoaded = this.load();
    let privateConfigDecrypted = this.decrypt();
    return localConfigCorrectlyLoaded && privateConfigDecrypted;
  },
  authors:computed("airtableKey", "configKey", "airtableEditorBase", function() {
    if (this.get("airtableKey") && this.get("airtableEditorBase")) {
      try {
        return this.get("store").query("author", {sort:[{field: "Nom", direction:"asc"}]});
      }
      catch (error) {
        return [];
      }
    } else {
      return [];
    }
  }),
  authorNames:computed("authors", function() {
    return this.get("authors").reduce((current, value) => {
      current.push(value.get("name"));
      return current;
    }, []);
  }),
  load() {
    try {
      let localConfig = localStorage.getItem("pix-config");
      if (localConfig) {
        let incomplete = false;
        localConfig = JSON.parse(localConfig);
        this.localConfigKeys.forEach((key) => {
          if (typeof localConfig[key] == "undefined") {
            incomplete = true;
          } else {
            this.set(key, localConfig[key]);
          }
        });
        this.localConfigKeysOptional.forEach((key) => {
          if (typeof localConfig[key] !== "undefined") {
            this.set(key, localConfig[key]);
          }
        });
        if (incomplete) {
          throw "local config incomplete";
        }
      } else {
        throw "no local config";
      }
    }
    catch (error) {
      console.error(error);
      return false;
    }
    return true;
  },
  decrypt() {
    try {
      let key = this.get("configKey");
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
  },
  save() {
    let localConfig = this.localConfigKeys.reduce((current, key) => {
      current[key] = this.get(key);
      return current;
    }, {});
    localConfig = this.localConfigKeysOptional.reduce((current, key) => {
      let value = this.get(key);
      if (value && typeof value !=="undefined" && (typeof value.length === "undefined" || value.length>0)) {
        current[key] = value;
      }
      return current;
    }, localConfig);
    localStorage.setItem("pix-config", JSON.stringify(localConfig));
  }

});
