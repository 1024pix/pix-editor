import ChallengeModel from './challenge';
import { computed } from '@ember/object';

export default ChallengeModel.extend({
  workbench:true,
  computedIndex:computed("alternativeIndex", function() {
    let index = this.get("alternativeIndex");
    if (index) {
      return parseInt(index[0]);
    } else {
      return null;
    }
  }),
  clone: function() {
    return this._super(["competence"]);
  }
});
