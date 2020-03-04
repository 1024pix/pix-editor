import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class ListController extends Controller {

  @tracked competence;

  @controller('competence')
  parentController;

  @service access;
  @service config;

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
    if (templates.length>0) {
      let template = templates.firstObject;
      this.transitionToRoute('competence.templates.new', this.competence, { queryParams: { from: template.id}});
    } else {
      this.transitionToRoute('competence.templates.new', this.competence/*, { queryParams: { fromSkill: this.model.id}}*/);
    }
  }
}
