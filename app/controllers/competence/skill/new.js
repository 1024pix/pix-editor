import Skill from './index';
import { alias } from '@ember/object/computed';

export default Skill.extend({
  competence:null,
  tubeId:null,
  skill:alias('model.skill'),
  tube:alias('model.tube'),
  actions: {
    cancelEdit() {
      this.get('store').deleteRecord(this.get('skill'));
      this.set('edition', false);
      this.get('application').send('showMessage', 'Création annulée', true);
      this.get('parentController').send('closeChildComponent');
    },
    save() {
      this.get("application").send("isLoading");
      let skill = this.get("skill");
      let tube = this.get("tube");
      return tube.get('competence')
      .then(competence=> {
        skill.set("tube", tube);
        skill.set("competence", [competence.get('id')]);
        return skill.save()
      })
      .then(() => {
        this.set("edition", false);
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Acquis créé", true);
      })
      .catch((error) => {
        console.error(error);
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la création de l'acquis", true);
      });
    }
  }
});
