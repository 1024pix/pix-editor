import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class GridCell extends Component {

  @service access;
  @service config;

  skill = null;
  productionTemplate = null;
  hasStatusProduction = false;

  get mayAddSkill() {
    return this.args.section === 'skills' && this.access.mayEditSkills();
  }

  get displaySkill() {
    const skill = this.args.skill;
    if (skill) {
      const view = this.args.view;
      const productionTemplate = skill.productionTemplate;
      switch(this.args.section) {
        case 'challenges':
          return ((view === 'production' && productionTemplate)
          || (view === 'workbench'));
        case 'quality':
          return (productionTemplate != null);
        case 'skills':
        default:
          return true;
      }
    }
    return false;
  }
}
