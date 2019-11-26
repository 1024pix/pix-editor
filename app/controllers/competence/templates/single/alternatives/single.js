import Template from '../../single';
import {computed} from '@ember/object';
import {scheduleOnce} from '@ember/runloop';
import {inject as controller} from '@ember/controller';

export default Template.extend({
  alternative:true,
  popinImageClass:"alternative-popin-image",
  popinLogClass:"popin-alternative-log",
  popinChangelogClass:"popin-alternative-changelog",
  copyZoneId:"copyZoneDraft",
  elementClass:"alternative-challenge",
  parentController:controller("competence.templates.single.alternatives"),
  defaultSaveChangelog:"Mise à jour de la déclinaison",
  challengeTitle:computed("creation", "challenge", function() {
    if (this.get("creation")) {
      return "Nouvelle déclinaison";
    } else {
      let index = this.get("challenge.alternativeVersion");
      return "Déclinaison n°"+index;
    }
  }),
  _executeCopy() {
    const element = document.getElementById(this.get("copyZoneId"));
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
  },
  actions:{
    preview() {
      let challenge = this.get("challenge");
      window.open(challenge.get("preview"), challenge.get("id"));
    },
    openAirtable() {
      let challenge = this.get("challenge");
      let config = this.get("config");
      window.open(config.get("airtableUrl")+config.get("tableChallenges")+"/"+challenge.get("id"), "airtable");
    },

    copyLink() {
      this.set("copyOperation", true);
      scheduleOnce('afterRender', this, this._executeCopy);
    }
  }
});
