import DS from 'ember-data';
import {computed} from "@ember/object";

export default DS.Model.extend({
  text:DS.attr(),
  challengeId:DS.attr(),
  author:DS.attr(),
  competence:DS.attr(),
  skills:DS.attr(),
  production:DS.attr(),
  createdAt:DS.attr(),
  status:DS.attr(),
  changelog:DS.attr("boolean", {defaultValue: false }),
  date:computed("createdAt", function() {
    let createdDate = this.get("createdAt");
    return (new Date(createdDate)).toLocaleDateString("fr");
  })
});
