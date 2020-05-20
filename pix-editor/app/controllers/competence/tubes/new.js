import Tube from './single';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewController extends Tube {
  creation = true;

  @service currentData;
  @service notify;

  @action
  save() {
    this.application.send('isLoading');
    let tube = this.tube;
    const competence = this.currentData.getCompetence();
    tube.competence = competence;
    return tube.save()
    .then(() => {
      this.edition = false;
      this.application.send('finishedLoading');
      this.notify.message('Tube créé');
    })
    .then(() => {
      this.transitionToRoute('competence.tubes.single', competence, tube);
    })
    .catch((error) => {
      console.error(error);
      this.application.send('finishedLoading');
      this.notify.error('Erreur lors de la création du tube');
    });
  }

  @action
  cancelEdit() {
    this.store.deleteRecord(this.tube);
    this.edition = false;
    this.notify.message('Création annulée')
    this.parentController.send('closeChildComponent');
  }
}
