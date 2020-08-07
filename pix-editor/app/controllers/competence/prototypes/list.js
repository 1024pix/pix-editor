import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ListController extends Controller {

  @controller('competence')
  parentController;

  @service access;
  @service config;
  @service currentData;

  get mayCreatePrototype() {
    return this.access.mayCreatePrototype();
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

  @action
  newVersion() {
    const prototypes = this.model.sortedPrototypes;
    if (prototypes.length > 0) {
      const prototype = prototypes.firstObject;
      this.transitionToRoute('competence.prototypes.new', this.currentData.getCompetence(), { queryParams: { from: prototype.id } });
    } else {
      this.transitionToRoute('competence.prototypes.new', this.currentData.getCompetence(), { queryParams: { fromSkill: this.model.id } });
    }
  }
}
