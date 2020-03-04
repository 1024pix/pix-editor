import classic from 'ember-classic-decorator';
import Controller from '@ember/controller';
import { computed, action } from '@ember/object';
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import {tracked} from '@glimmer/tracking';

@classic
export default class AlternativesController extends Controller {

  @tracked challenge = null;
  @tracked competence = null;

  @service router;
  @service config;
  @service access;

  @controller application;

  @controller('competence') competenceController;

  queryParams = ['secondMaximized'];

  secondMaximized = false;

  @computed('config.access')
  get mayCreateAlternative() {
    return this.get('access').mayCreateAlternative();
  }

  @computed('router.currentRouteName')
  get size() {
    if (this.get('router.currentRouteName') == 'competence.templates.single.alternatives.index') {
      return 'full';
    } else {
      return 'half';
    }
  }

  @computed('secondMaximized')
  get listHidden() {
    return this.get('secondMaximized')?'hidden':'';
  }

  @action
  newAlternative() {
    this.transitionToRoute('competence.templates.single.alternatives.new', this.get('competence'),  this.get('challenge'));
  }

  @action
  closeChildComponent() {
    this.set('secondMaximized', false);
    this.transitionToRoute('competence.templates.single.alternatives', this.get('competence'), this.get('challenge'));
  }

  @action
  copyChallenge(challenge) {
    this.transitionToRoute('competence.templates.single.alternatives.new', this.get('competence'),  this.get('challenge'), { queryParams: {from: challenge.get('id')}});
  }

  @action
  refresh() {
    this.get('competenceController').send('refresh');
  }

  @action
  selectView() {
    // does nothing
  }
}
