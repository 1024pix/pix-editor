import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {

  @controller('competence')
  parentController;

  @service access;
  @service config;
  @service currentData;

  @tracked selectedSkillId = null;

  get mayCreatePrototype() {
    return this.access.mayCreatePrototype();
  }

  get firstSkill() {
    this.selectedSkillId = this.model.skill.id;
    return this.model.skill;
  }

  get selectedSkillOrFirstSkill() {
    return this._getSkill(this.selectedSkillId) || this.firstSkill();
  }

  _getSkill(value) {
    return this.model.skills.find(skill=>skill.id === value);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

  @action
  setSelectedSkill(value) {
    this.selectedSkillId = value;
  }

  @action
  newVersion() {
    const prototypes = this.selectedSkillOrFirstSkill.sortedPrototypes;
    if (prototypes.length > 0) {
      const prototype = prototypes.firstObject;
      this.transitionToRoute('competence.prototypes.new', this.currentData.getCompetence(), { queryParams: { from: prototype.id } });
    } else {
      this.transitionToRoute('competence.prototypes.new', this.currentData.getCompetence(), { queryParams: { fromSkill: this.selectedSkillOrFirstSkill.id } });
    }
  }
}
