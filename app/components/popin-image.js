import Component from '@ember/component';
import $ from "jquery";
import { observer } from '@ember/object';

export default Component.extend({
  displayManager:observer("display", function() {
    if (this.get("display")) {
      $("<img/>").on("load", function() {
        $(".popin-image").modal('show');
      }).attr("src", this.get("src"));
    }
  }),
  actions:{
    closed() {
      this.set("display", false);
    }
  }
});
