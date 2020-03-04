import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import {inject as controller} from '@ember/controller';
import {scheduleOnce} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';

@classic
export default class SingleController extends Controller {
  @controller('competence')
  parentController;

  @alias('parentController.firstMaximized')
  maximized;

  @controller
  application;

  @service
  config;

  @service
  access;

  @alias('model')
  skill;

  wasMaximized = false;
  @tracked edition = false;
  displaySelectLocation = false;

  @computed('skill')
  get skillName() {
    return `${this.get('skill.pixId')} (${this.get('skill.name')})`;
  }

  @computed('config.access')
  get mayEdit() {
    return this.get('access').mayEditSkills();
  }

  @computed('config.access')
  get mayAccessAirtable() {
    return this.get('access').mayAccessAirtable();
  }

  @computed('config.access', 'skill', 'skill.productionTemplate')
  get mayMove() {
    return this.get('access').mayMoveSkill(this.get('skill'));
  }

  _scrollToTop() {
    document.querySelector('.skill-data').scrollTop = 0;
  }

  @action
  previewTemplate() {
    const template = this.get('skill.productionTemplate');
    window.open(template.get('preview'), template.get('id'));
  }

  @action
  openAirtable() {
    let skill = this.get('skill');
    let config = this.get('config');
    window.open(config.get('airtableUrl') + config.get('tableSkills') + '/' + skill.get('id'), 'airtable');
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
    this.transitionToRoute('competence.skills', this.get('competence'));
  }

  @action
  edit() {
    let state = this.get('maximized');
    this.set('wasMaximized', state);
    this.get('maximize')();
    this.set('edition', true);
    scheduleOnce('afterRender', this, this._scrollToTop);
  }

  @action
  cancelEdit() {
    this.set('edition', false);
    let skill = this.get('skill');
    skill.rollbackAttributes();
    const challenge = this.get('skill.productionTemplate');
    if (challenge) {
      challenge.rollbackAttributes();
    }
    let previousState = this.get('wasMaximized');
    if (!previousState) {
      this.get('minimize')();
    }
    this.get('application').send('showMessage', 'Modification annulée', true);
  }

  @action
  save() {
    this.get('application').send('isLoading');
    let skill = this.get('skill');
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
      this.set('edition', false);
      this.get('application').send('finishedLoading');
      this.get('application').send('showMessage', 'Acquis mis à jour', true);
    })
    .catch((error) => {
      console.error(error);
      this.get('application').send('finishedLoading');
      this.get('application').send('showMessage', 'Erreur lors de la mise à jour de l\'acquis', true);
    });
  }

  @action
  moveSkill() {
   this.set('displaySelectLocation', true)
  }

  @action
  setLocation(competence, newTube, level) {
    let skill = this.get('skill');
    this.get('application').send('isLoading');
    skill.set('tube', newTube);
    skill.set('level', level);
    skill.set('competence', [competence.get('id')]);
    return skill.save()
      .then(() => {
        this.get('application').send('finishedLoading');
        this.get('application').send('showMessage', 'Acquis mis à jour', true);
        this.transitionToRoute('competence.skills.single', competence, skill);
      })
      .catch((error) => {
        console.error(error);
        this.get('application').send('finishedLoading');
        this.get('application').send('showMessage', 'Erreur lors de la mise à jour de l\'acquis', true);
      });
  }

  @action
  closeSelectLocation() {
    this.set('displaySelectLocation', false);
  }
}
