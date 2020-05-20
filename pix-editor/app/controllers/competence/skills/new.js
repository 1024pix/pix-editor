import Skill from './single';
import {action} from '@ember/object';
import {alias} from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class NewController extends Skill {
  competence = null;
  tubeId = null;

  @alias('model.skill')
  skill;

  @alias('model.tube')
  tube;

  @service notify;

  @action
  cancelEdit() {
    this.store.deleteRecord(this.skill);
    this.edition = false;
    this.notify.message('Création annulée');
    this.parentController.send('closeChildComponent');
  }

  @action
  save() {
    this.application.send('isLoading');
    let skill = this.skill;
    let tube = this.tube;
    return tube.competence
    .then(competence=> {
      skill.tube = tube;
      skill.competence = [competence.get('id')];
      return skill.save()
    })
    .then(() => {
      this.edition = false;
      this.application.send('finishedLoading');
      this.notify.message('Acquis créé');
    })
    .catch((error) => {
      console.error(error);
      this.application.send('finishedLoading');
      this.notify.error('Erreur lors de la création de l\'acquis');
    });
  }
}
