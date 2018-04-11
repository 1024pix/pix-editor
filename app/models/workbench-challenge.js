import ChallengeModel from './challenge';
import { computed } from '@ember/object';

export default ChallengeModel.extend({
  workbench:true,
  computedIndex:computed("alternativeIndex", function() {
    return this.get("alternativeIndex");
  })
});
