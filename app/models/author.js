import DS from 'ember-data';
import {computed} from "@ember/object";

export default DS.Model.extend({
  name: DS.attr(),
  liteValue: DS.attr(),
  lite:computed("liteValue", function() {
    let liteValue = this.get("liteValue");
    if (liteValue === "Non") {
      return false;
    }
    return true;
  })
});
