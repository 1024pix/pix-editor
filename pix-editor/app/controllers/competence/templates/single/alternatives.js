import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {inject as controller} from '@ember/controller';
import {tracked} from '@glimmer/tracking';
import {alias} from '@ember/object/computed';

export default class AlternativesController extends Controller {

  queryParams = ['rightMaximized'];

  @alias('model')
  challenge;

  @tracked competence = null;
  @tracked rightMaximized = false;

  @service router;
  @service config;
  @service access;
  @service currentData;

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

  maximizeRight(value) {
    if (this.rightMaximized != value) {
      this.rightMaximized = value;
    }
  }

  @action
  newAlternative() {
    this.transitionToRoute('competence.templates.single.alternatives.new', this.currentData.getCompetence(),  this.challenge);
  }

  @action
  closeChildComponent() {
    this.maximizeRight(false);
    this.transitionToRoute('competence.templates.single.alternatives', this.currentData.getCompetence(), this.challenge);
  }

  @action
  copyChallenge(challenge) {
    this.transitionToRoute('competence.templates.single.alternatives.new', this.currentData.getCompetence(),  this.challenge, {queryParams: {from: challenge.id}});
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
