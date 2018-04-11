import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.alternatives = {};
  },
  competence:DS.attr(),
  instructions:DS.attr(),
  type:DS.attr(),
  suggestion:DS.attr(),
  answers:DS.attr(),
  t1:DS.attr(),
  t2:DS.attr(),
  t3:DS.attr(),
  illustration:DS.attr(),
  attachments:DS.attr(),
  pedagogy:DS.attr(),
  author:DS.attr(),
  declinable:DS.attr(),
  version:DS.attr(),
  genealogy:DS.attr(),
  skillNames:DS.attr({readOnly:true}),
  skills:DS.attr(),
  workbench:false,
  status:DS.attr(),
  preview:DS.attr({readOnly:true}),
  pixId:DS.attr(),
  alternativeIndex:DS.attr(),
  template:computed('genealogy', function(){
    return (this.get('genealogy') == 'Prototype 1');
  }),
  validated:computed('status', function(){
    let status = this.get('status');
    return ["validated", "validé sans test", "pré-validé"].includes(status);
  }),
  notDeclinable:computed('declinable', function() {
    let declinable = this.get("declinable");
    return (declinable && declinable === "non");
  }),
  computedIndex:computed("pixId", function() {
    let pixId = this.get("pixId");
    if (pixId) {
      let parts = pixId.split("_");
      return parts[parts.length - 1];
    } else {
      return -1;
    }
  }),
  alternativeCount:0,
  statusCSS:computed('status', function() {
    let status = this.get('status');
    switch (status) {
      case "validé":
        return "validated";
      case "validé sans test":
        return "validated_no_test";
      case "proposé":
        return "suggested";
      case "pré-validé":
        return "prevalidated";
      case "archivé":
        return "archived";
    }
  })
});
