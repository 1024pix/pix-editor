import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

export default class CompetenceHistoryListController extends Controller {

  @controller('competence')
  parentController;

  @alias('parentController.leftMaximized')
  isMaximized;

  @service access;
  @service currentData;

  get firstSkill() {
    return this.model.sortedSkills[0];
  }

  get mayCreateSkill() {
    return this.access.mayEditSkills();
  }

  @action
  addSkill() {
    const tube = this.model.tube;
    const level = parseInt(this.firstSkill.level) - 1;
    this.transitionToRoute('competence.skills.new', this.currentData.getCompetence(), tube.id, level);
  }

  @action
  maximize() {
    this.parentController.maximizeLeft(true);
  }

  @action
  minimize() {
    this.parentController.maximizeLeft(false);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }
}
