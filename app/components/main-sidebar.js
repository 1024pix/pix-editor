import Component from '@ember/component';
import ENV from "pixeditor/config/environment";
import {inject as service} from "@ember/service";
import {computed} from "@ember/object";

export default Component.extend({
  tagName:"",
  version:ENV.APP.version,
  config:service(),
  author:computed("config.author",function() {
    return this.get("config").get("author");
  })
});
