import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import $ from "jquery";

export default Controller.extend({
  maximized:false,
  competence:controller(),
  application:controller(),
  config:service(),
  skill:alias("model"),
  wasMaximized:false,
  edition:false,
  actions: {
    maximize() {
      this.set("maximized", true);
      this.get("competence").send("maximizeChildComponent");
    },
    minimize() {
      this.set("maximized", false);
      this.get("competence").send("minimizeChildComponent");
    },
    close() {
      this.set("maximized", false);
      this.get("competence").send("closeChildComponent");
    },
    preview() {
      let challenge = this.get("skill").get("template");
      window.open(challenge.get("preview"), challenge.get("id"));
    },
    openAirtable() {
      let skill = this.get("skill");
      let config = this.get("config");
      window.open(config.get("airtableUrl")+config.get("tableSkills")+"/"+skill.get("id"), "airtable");
    },
    edit() {
      let state = this.get("maximized");
      this.set("wasMaximized", state);
      this.send("maximize");
      this.set("edition", true);
      $(".skill-data").scrollTop(0);
    },
    cancelEdit() {
      this.set("edition", false);
      let skill = this.get("skill");
      skill.rollbackAttributes();
      let previousState = this.get("wasMaximized");
      if (!previousState) {
        this.send("minimize");
      }
      this.get("application").send("showMessage", "Modification annulée", true);
    },
    save() {
      this.get("application").send("isLoading");
      let skill = this.get("skill");
      skill.save()
      .then(()=> {
        this.set("edition", false);
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Acquis mis à jour", true);
      })
      .catch((error) => {
        console.error(error);
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la mise à jour de l'acquis", true);
      });
    }
  }
});
