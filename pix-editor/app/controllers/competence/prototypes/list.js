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

  @tracked selectedSkillIndex = null;


  get mayCreatePrototype() {
    return this.access.mayCreatePrototype();
  }

  get firstSkill() {
    if (this.model.activeSkill) {
      this.selectedSkillIndex = -1;
    } else {
      this.selectedSkillIndex = 0;
    }
    return this.model.activeSkill || this.model.draftSkills[0];
  }

  get selectedSkillOrFirstSkill() {
    return this._getSkill(this.selectedSkillIndex) || this.firstSkill;
  }

  _getSkill(value) {
    switch (value) {
      case null :
        return false;
      case -1 :
        return this.model.activeSkill;
      default :
        return this.model.draftSkills[value];
    }
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

  @action
  setSelectedSkill(value) {
    this.selectedSkillIndex = value;
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
