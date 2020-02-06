import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import Skill from './single';

@classic
export default class NewController extends Skill {
  competence = null;
  tubeId = null;

  @alias('model.skill')
  skill;

  @alias('model.tube')
  tube;

  @action
  cancelEdit() {
    this.get('store').deleteRecord(this.get('skill'));
    this.set('edition', false);
    this.get('application').send('showMessage', 'Création annulée', true);
    this.get('parentController').send('closeChildComponent');
  }

  @action
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
