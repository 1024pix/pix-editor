import Component from '@ember/component';
import { observer } from '@ember/object';
import $ from "jquery";

export default Component.extend({
  displayManager:observer("display", function() {
    if (this.get("display")) {
      $(".popin-confirm").modal('show');
    }
  })
});
