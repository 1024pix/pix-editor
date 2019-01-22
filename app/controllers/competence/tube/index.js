import Controller from '@ember/controller';
import {computed} from '@ember/object';
import {alias} from '@ember/object/computed';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import $ from "jquery";

export default Controller.extend({
  edition:false,
  maximized:false,
  wasMaximized:false,
  tube:alias('model'),
  application:controller(),
  parentController:controller("competence"),
  access:service(),
  config:service(),
  mayAccessAirtable:computed("config.access", function() {
    return this.get("access").mayAccessAirtable();
  }),
  mayEdit:computed("config.access", function() {
    return this.get("access").mayEditTube();
  }),
  actions: {
    maximize() {
      this.set("maximized", true);
      this.get("parentController").send("maximizeChildComponent");
    },
    minimize() {
      this.set("maximized", false);
      this.get("parentController").send("minimizeChildComponent");
    },
    close() {
      this.set("maximized", false);
      this.get("parentController").send("closeChildComponent");
    },
    edit() {
      let state = this.get("maximized");
      this.set("wasMaximized", state);
      this.send("maximize");
      this.set("edition", true);
      $(".tube-data").scrollTop(0);
    },
    cancelEdit() {
      this.set("edition", false);
      let tube = this.get("tube");
      tube.rollbackAttributes();
      let previousState = this.get("wasMaximized");
      if (!previousState) {
        this.send("minimize");
      }
      this.get("application").send("showMessage", "Modification annulée", true);
    },
    save() {
      this.get("application").send("isLoading");
      let tube = this.get("tube");
      tube.save()
      .then(()=> {
        this.set("edition", false);
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Tube mis à jour", true);
      })
      .catch((error) => {
        console.error(error);
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la mise à jour du tube", true);
      });
    },
    openAirtable() {
      let tube = this.get("tube");
      let config = this.get("config");
      window.open(config.get("airtableUrl")+config.get("tableTubes")+"/"+tube.get("id"), "airtable");
    }
  }
});
