import Challenge from '../../challenge';
import {computed} from '@ember/object';

export default Challenge.extend({
  workbench:true,
  copyZoneId:"copyZoneWorkbench",
  challengeTitle:computed("challenge", function() {
    let challenge = this.get("challenge");
    if (challenge) {
      let pixId = challenge.get("pixId");
      if (pixId) {
        return pixId
      } else {
        let alternativeIndex = challenge.get("alternativeIndex");
        if (alternativeIndex) {
          return "Déclinaison n°"+alternativeIndex;
        } else {
          return "Déclinaison (pas d'indice)";
        }
      }
    }
  }),

});
