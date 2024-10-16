import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {

  @controller('authenticated.competence')
    parentController;

  @service access;
  @service config;
  @service currentData;
  @service router;

  @tracked selectedSkill;

  get mayCreatePrototype() {
    return this.access.mayCreatePrototype();
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

  @action
  setSelectedSkill(value) {
    this.selectedSkill = value;
  }

  @action
  newVersion() {
    const prototypes = this.selectedSkill.sortedPrototypes;
    if (prototypes.length > 0) {
      const prototype = prototypes[0];
      this.router.transitionTo('authenticated.competence.prototypes.new', this.currentData.getCompetence(), { queryParams: { from: prototype.id } });
    } else {
      this.router.transitionTo('authenticated.competence.prototypes.new', this.currentData.getCompetence(), { queryParams: { fromSkill: this.selectedSkill.id } });
    }
  }
}
