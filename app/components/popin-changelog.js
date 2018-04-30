import Component from '@ember/component';
import { observer } from '@ember/object';
import $ from "jquery";

export default Component.extend({
  value:"",
  displayManager:observer("display", function() {
    if (this.get("display")) {
      $(".popin-changelog").modal('show');
    }
  }),
  actions:{
    confirm() {
      this.get("approve")(this.get("value"));
    }
  }
});
