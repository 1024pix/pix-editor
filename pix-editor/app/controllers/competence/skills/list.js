import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CompetenceHistoryListController extends Controller {

  @controller('competence')
  parentController;

  @service access;
  @service currentData;
  @service router;

  get firstSkill() {
    return this.model.sortedSkills[0];
  }

  get mayCreateSkill() {
    return this.access.mayEditSkills();
  }

  @action
  newSkillVersion() {
    const tube = this.model.tube;
    const level = parseInt(this.firstSkill.level) - 1;
    this.router.transitionTo('competence.skills.new', this.currentData.getCompetence(), tube.id, level);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }
}
