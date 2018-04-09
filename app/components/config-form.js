import Component from '@ember/component';
import $ from "jquery";
import { observer, computed } from '@ember/object';
import {inject as service} from '@ember/service';

export default Component.extend({
  config:service(),
  airtableKey:"",
  configKey:"",
  author:"",
  pixUser:"",
  pixPassword:"",
  saved:false,
  displayManager:observer("display", function() {
    if (this.get("display")) {
      $(".config-form").modal('show');
      let config = this.get("config");
      config.load();
      this.set("airtableKey", config.get("airtableKey"));
      this.set("configKey", config.get("configKey"));
      this.set("author", config.get("author"));
      this.set("pixUser", config.get("pixUser"));
      this.set("pixPassword", config.get("pixPassword"));
      this.set("saved", false);
    }
  }),
  authors:computed("config.authors", function() {
    return this.get("config.authors");
  }),
  actions:{
    saveConfig() {
      let config = this.get("config");
      config.set("airtableKey", this.get("airtableKey"));
      config.set("configKey", this.get("configKey"));
      let author = this.get("author");
      let lite = true;
      config.set("author", author);
      let authorRecord = this.get("authors").find((value) => {
        return value.get("name") === author;
      });
      if (authorRecord) {
        lite = authorRecord.get("lite");
      }
      config.set("lite", lite);
      config.set("pixUser", this.get("pixUser"));
      config.set("pixPassword", this.get("pixPassword"));
      config.save();
      this.set("saved", true);
    },
    closed() {
      this.set("display", false);
      if (this.get("saved")) {
        this.get("update")();
      }
    }
  }
});
