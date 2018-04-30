import Challenge from '../../challenge';
import {computed} from '@ember/object';
import {scheduleOnce} from '@ember/runloop';
import {inject as controller} from '@ember/controller';

export default Challenge.extend({
  alternative:true,
  copyZoneId:"copyZoneWorkbench",
  elementClass:"alternative-challenge",
  parentController:controller("competence.challenge.alternatives"),
  defaultSaveChangelog:"Mise à jour de la déclinaison",
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
  actions:{
    preview() {
      let challenge = this.get("challenge");
      window.open(challenge.get("preview"), challenge.get("id"));
    },
    openAirtable() {
      let challenge = this.get("challenge");
      let config = this.get("config");
      if (challenge.get("workbench")) {
        window.open(config.get("airtableUrl")+config.get("tableWorkbench")+"/"+challenge.get("id"), "airtable");
      } else {
        window.open(config.get("airtableUrl")+config.get("tableChallenges")+"/"+challenge.get("id"), "airtable");
      }
    },
    copyLink() {
      this.set("copyOperation", true);
      scheduleOnce('afterRender', this, function() {
        let element = document.getElementById(this.get("copyZoneId"));
        element.select();
        try {
          var successful = document.execCommand("copy");
          if (!successful) {
            this.get("application").send("showMessage", "Erreur lors de la copie", false);
          } else {
            this.get("application").send("showMessage", "lien copié", true);
          }
        } catch (err) {
          this.get("application").send("showMessage", "Erreur lors de la copie", false);
        }
        this.set("copyOperation", false);
      });
    }
  }
});
