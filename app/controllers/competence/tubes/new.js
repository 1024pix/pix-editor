import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Tube from './single';

@classic
export default class NewController extends Tube {
  competence = null;
  creation = true;

  @action
  save() {
    this.get('application').send('isLoading');
    let tube = this.get('tube');
    let competence = this.get('competence');
    tube.set('competence', competence);
    return tube.save()
    .then(() => {
      this.set('edition', false);
      this.get('application').send('finishedLoading');
      this.get('application').send('showMessage', 'Tube créé', true);
    })
    .then(() => {
      this.transitionToRoute("competence.tubes.single", competence, tube);
    })
    .catch((error) => {
      console.error(error);
      this.get('application').send('finishedLoading');
      this.get('application').send('showMessage', 'Erreur lors de la création du tube', true);
    });
  }

  @action
  cancelEdit() {
    this.get('store').deleteRecord(this.get('tube'));
    this.set('edition', false);
    this.get('application').send('showMessage', 'Création annulée', true);
    this.get('parentController').send('closeChildComponent');
  }
}
