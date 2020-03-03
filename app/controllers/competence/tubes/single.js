import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import {scheduleOnce} from '@ember/runloop';

@classic
export default class SingleController extends Controller {
  edition = false;
  creation = false;
  wasMaximized = false;
  displaySelectLocation = false;

  @alias('model')
  tube;

  @controller
  application;

  @controller('competence')
  parentController;

  @alias('parentController.firstMaximized')
  maximized;

  areas = null;
  competence = null;

  @service
  access;

  @service
  config;

  @computed('config.access')
  get mayAccessAirtable() {
    return this.get('access').mayAccessAirtable();
  }

  @computed('config.access')
  get mayEdit() {
    return this.get('access').mayEditSkills();
  }

  @computed('config.access', 'tube', 'tube.hasProductionChallenge')
  get mayMove() {
    return this.get('access').mayMoveTube(this.get('tube'));
  }

  _scrollToTop() {
    const tubeData = document.querySelector('.tube-data');
    if(tubeData){
      tubeData.scrollTop = 0;
    }
  }

  @action
  maximize() {
    this.set('maximized', true);
  }

  @action
  minimize() {
    this.set('maximized', false);
  }

  @action
  close() {
    this.set('maximized', false);
    this.get('parentController').send('closeChildComponent');
  }

  @action
  edit() {
    const state = this.get('maximized');
    this.set('wasMaximized', state);
    this.send('maximize');
    this.set('edition', true);
    scheduleOnce('afterRender', this, this._scrollToTop);
  }

  @action
  cancelEdit() {
    this.set('edition', false);
    let tube = this.get('tube');
    tube.rollbackAttributes();
    let previousState = this.get('wasMaximized');
    if (!previousState) {
      this.send('minimize');
    }
    this.get('application').send('showMessage', 'Modification annulée', true);
  }

  @action
  save() {
    this.get('application').send('isLoading');
    let tube = this.get('tube');
    return tube.save()
    .then(()=> {
      this.set('edition', false);
      this.get('application').send('finishedLoading');
      this.get('application').send('showMessage', 'Tube mis à jour', true);
      return tube.hasMany('rawSkills').reload();
    })
    .catch((error) => {
      console.error(error);
      this.get('application').send('finishedLoading');
      this.get('application').send('showMessage', 'Erreur lors de la mise à jour du tube', true);
    });
  }

  @action
  openAirtable() {
    let tube = this.get('tube');
    let config = this.get('config');
    window.open(`${config.get('airtableUrl')}${config.get('tableTubes')}/${tube.get('id')}`, 'airtable');
  }

  @action
  selectCompetence() {
   this.set('displaySelectLocation', true);
  }

  @action
  closeSelectLocation() {
    this.set('displaySelectLocation', false);
  }

  @action
  setCompetence(newCompetence) {
    let tube = this.get('tube');
    this.get('application').send('isLoading');
    tube.set('competence', newCompetence);
    return tube.save()
    .then(() => {
      this.get('application').send('finishedLoading');
      this.get('application').send('showMessage', 'Tube mis à jour', true);
      this.transitionToRoute('competence.tubes.single', newCompetence, tube);
    })
    .catch((error) => {
      console.error(error);
      this.get('application').send('finishedLoading');
      this.get('application').send('showMessage', 'Erreur lors de la mise à jour du tube', true);
    });
  }
}
