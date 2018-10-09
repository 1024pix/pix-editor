import DS from "ember-data";
import ChallengeModel from './challenge';
import { computed, observer } from '@ember/object';

export default ChallengeModel.extend({
  workbench:true,
  skills:null,/*DS.hasMany('workbench-skill'),*/
  computedIndex:computed("alternativeIndex", function() {
    let index = this.get("alternativeIndex");
    if (index) {
      return parseInt(index);
    } else {
      return null;
    }
  }),
  clone: function() {
    return this._super(["competence"]);
  }
});
