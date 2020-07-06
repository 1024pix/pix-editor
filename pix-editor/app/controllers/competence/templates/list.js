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

  get mayCreateTemplate() {
    return this.access.mayCreateTemplate();
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

  @action
  newVersion() {
    const templates = this.model.sortedTemplates;
    if (templates.length > 0) {
      const template = templates.firstObject;
      this.transitionToRoute('competence.templates.new', this.currentData.getCompetence(), { queryParams: { from: template.id } });
    } else {
      this.transitionToRoute('competence.templates.new', this.currentData.getCompetence(), { queryParams: { fromSkill: this.model.id } });
    }
  }
}
