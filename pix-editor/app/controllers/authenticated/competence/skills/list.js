import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CompetenceHistoryListController extends Controller {

  @controller('authenticated.competence')
  parentController;

  @service access;
  @service currentData;
  @service router;

  get skillName() {
    return this.model.sortedSkills[0].name;
  }

  get mayCreateSkill() {
    return this.access.mayEditSkills();
  }

  @action
  newSkillVersion() {
    const tube = this.model.tube;
    const level = parseInt(this.firstSkill.level) - 1;
    this.router.transitionTo('authenticated.competence.skills.new', this.currentData.getCompetence(), tube.id, level);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }
}
