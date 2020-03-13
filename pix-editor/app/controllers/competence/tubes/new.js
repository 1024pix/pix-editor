import Tube from './single';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewController extends Tube {
  creation = true;

  @service currentData;

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
      this.application.send('showMessage', 'Tube créé', true);
    })
    .then(() => {
      this.transitionToRoute('competence.tubes.single', competence, tube);
    })
    .catch((error) => {
      console.error(error);
      this.application.send('finishedLoading');
      this.application.send('showMessage', 'Erreur lors de la création du tube', true);
    });
  }

  @action
  cancelEdit() {
    this.store.deleteRecord(this.tube);
    this.edition = false;
    this.application.send('showMessage', 'Création annulée', true);
    this.parentController.send('closeChildComponent');
  }
}
