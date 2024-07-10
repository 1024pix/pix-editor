import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AlternativesController extends Controller {

  queryParams = ['rightMaximized'];

  @tracked rightMaximized = false;
  @service access;

  @service currentData;
  @service router;

  @controller('authenticated.competence') competenceController;

  get mayCreateAlternative() {
    return this.access.mayCreateAlternative();
  }

  get size() {
    if (this.router.currentRouteName == 'authenticated.competence.prototypes.single.alternatives.index') {
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
    this.router.transitionTo('authenticated.competence.prototypes.single.alternatives.new', this.currentData.getCompetence(),  this.model);
  }

  @action
  closeChildComponent() {
    this.maximizeRight(false);
    this.router.transitionTo('authenticated.competence.prototypes.single.alternatives', this.currentData.getCompetence(), this.model);
  }

  @action
  copyChallenge(challenge) {
    this.router.transitionTo('authenticated.competence.prototypes.single.alternatives.new', this.currentData.getCompetence(),  this.model, { queryParams: { from: challenge.id } });
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
