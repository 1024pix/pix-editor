import Controller from '@ember/controller';
import {inject as controller} from '@ember/controller';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import {computed} from '@ember/object';
import {scheduleOnce} from '@ember/runloop';


export default Controller.extend({
  parentController: controller("competence"),
  maximized: alias('parentController.firstMaximized'),
  application: controller(),
  config: service(),
  access: service(),
  skill: alias("model"),
  wasMaximized: false,
  edition: false,
  displaySelectLocation:false,
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
  _scrollToTop() {
    document.querySelector(".skill-data").scrollTop = 0;
  },
  actions: {
    maximize() {
      this.set("maximized", true);
    },
    minimize() {
      this.set("maximized", false);
    },
    close() {
      this.set("maximized", false);
      this.transitionToRoute('competence.skills', this.get('competence'));
    },
    preview() {
      const template = this.get("skill.productionTemplate");
      window.open(template.get("preview"), template.get("id"));
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
      scheduleOnce('afterRender', this, this._scrollToTop);
    },
    cancelEdit() {
      this.set("edition", false);
      let skill = this.get("skill");
      skill.rollbackAttributes();
      const challenge = this.get('skill.productionTemplate');
      if (challenge) {
        challenge.rollbackAttributes();
      }
      let previousState = this.get("wasMaximized");
      if (!previousState) {
        this.send("minimize");
      }
      this.get("application").send("showMessage", "Modification annulée", true);
    },
    save() {
      this.get("application").send("isLoading");
      let skill = this.get("skill");
      const template = this.get('skill.productionTemplate');
      let operation;
      if (template) {
        operation = template.save();
      } else {
        operation = Promise.resolve();
      }
      return operation.then(()=>{
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
     this.set('displaySelectLocation', true)
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
          this.transitionToRoute("competence.skills.single", competence, skill);
        })
        .catch((error) => {
          console.error(error);
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Erreur lors de la mise à jour de l'acquis", true);
        });
    }
  }
});
