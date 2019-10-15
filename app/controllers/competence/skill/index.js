import Controller from '@ember/controller';
import {inject as controller} from '@ember/controller';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import $ from "jquery";
import {computed} from '@ember/object';

export default Controller.extend({
  maximized: false,
  parentController: controller("competence"),
  application: controller(),
  config: service(),
  access: service(),
  skill: alias("model"),
  wasMaximized: false,
  edition: false,
  skillName: computed("skill", function () {
    return `${this.get('skill.id')} (${this.get('skill.name')})`;
  }),
  mayEdit: computed("config.access", function () {
    return this.get("access").mayEditSkills();
  }),
  mayAccessAirtable: computed("config.access", function () {
    return this.get("access").mayAccessAirtable();
  }),
  mayMove: computed("config.access", "skill", "skill.productionTemplate", function () {
    return this.get('access').mayMoveSkill(this.get('skill'));
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
    preview() {
      this.get("skill.productionTemplate")
        .then(challenge => {
          window.open(challenge.get("preview"), challenge.get("id"));
        });
    },
    openAirtable() {
      let skill = this.get("skill");
      let config = this.get("config");
      window.open(config.get("airtableUrl") + config.get("tableSkills") + "/" + skill.get("id"), "airtable");
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
      this.get('skill.productionTemplate')
        .then((challenge) => {
          if(challenge){
            challenge.rollbackAttributes();
          }
          let previousState = this.get("wasMaximized");
          if (!previousState) {
            this.send("minimize");
          }
          this.get("application").send("showMessage", "Modification annulée", true);
        })
        .catch((error) => {
          console.log(error);
          this.get("application").send("showMessage", "erreur", true);
        });
    },
    save() {
      this.get("application").send("isLoading");
      let skill = this.get("skill");
      this.get('skill.productionTemplate')
        .then((challenge) => {
          if (challenge) {
            return challenge.save();
          } else {
            return Promise.resolve();
          }
        })
        .then(()=>{
          return skill.save();
        })
        .then(() => {
          this.set("edition", false);
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Acquis mis à jour", true);
        })
        .catch((error) => {
          console.error(error);
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Erreur lors de la mise à jour de l'acquis", true);
        });
    },
    moveSkill() {
      $('.skill-select-location').modal('show');
    },
    setLocation(competence, newTube, level) {
      let skill = this.get('skill');
      this.get("application").send("isLoading");
      skill.set('tube', newTube);
      skill.set('level', level);
      skill.set('competence', [competence.get('id')]);
      return skill.save()
        .then(() => {
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Acquis mis à jour", true);
          this.transitionToRoute("competence.skill.index", competence, skill);
        })
        .catch((error) => {
          console.error(error);
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Erreur lors de la mise à jour de l'acquis", true);
        });
    }
  }
});
