import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {inject as controller} from '@ember/controller';
import {tracked} from '@glimmer/tracking';

export default class AlternativesController extends Controller {

  queryParams = ['secondMaximized'];

  @tracked challenge = null;
  @tracked competence = null;
  @tracked secondMaximized = false;

  @service router;
  @service config;
  @service access;

  @controller application;
  @controller('competence') competenceController;

  get mayCreateAlternative() {
    return this.access.mayCreateAlternative();
  }

  get size() {
    if (this.router.currentRouteName == 'competence.templates.single.alternatives.index') {
      return 'full';
    } else {
      return 'half';
    }
  }

  get listHidden() {
    return this.secondMaximized?'hidden':'';
  }

  @action
  newAlternative() {
    this.transitionToRoute('competence.templates.single.alternatives.new', this.competence,  this.challenge);
  }

  @action
  closeChildComponent() {
    this.secondMaximized = false;
    this.transitionToRoute('competence.templates.single.alternatives', this.competence, this.challenge);
  }

  @action
  copyChallenge(challenge) {
    this.transitionToRoute('competence.templates.single.alternatives.new', this.competence,  this.challenge, { queryParams: {from: challenge.id}});
  }

  @action
  refresh() {
    this.competenceController.send('refresh');
  }

  @action
  selectView() {
    // does nothing
  }
}
