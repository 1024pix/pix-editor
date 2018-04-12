import Challenge from '../../challenge';
import {computed} from '@ember/object';
import {scheduleOnce} from '@ember/runloop';
import {inject as controller} from '@ember/controller';

export default Challenge.extend({
  alternative:true,
  copyZoneId:"copyZoneWorkbench",
  elementClass:"alternative-challenge",
  alternatives:controller("competence.challenge.alternatives"),
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
    maximize() {
      this.set("maximized", true);
      this.get("alternatives").send("maximizeChildComponent");
    },
    minimize() {
      this.set("maximized", false);
      this.get("alternatives").send("minimizeChildComponent");
    },
    close() {
      this.set("maximized", false);
      this.get("alternatives").send("closeChildComponent");
    },
    preview() {
      let challenge = this.get("challenge");
      window.open(challenge.get("preview"), challenge.get("id"));
    },
    openAirtable() {
      let challenge = this.get("challenge");
      let config = this.get("config");
      window.open(config.get("airtableUrl")+config.get("tableWorkbench")+"/"+challenge.get("id"), "airtable");
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
    },
    save() {
      this.get("application").send("isLoading");
      return this._saveChallenge()
      .then(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Épreuve mise à jour", true);
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la mise à jour", false);
      });
    },
    duplicate() {
      this.get("application").send("showMessage", "Bientôt disponible...", true);
      //this.get("competence").send("copyChallenge", this.get("challenge").get("id"));
    }
}
});
