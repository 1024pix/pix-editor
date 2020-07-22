import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class GridCell extends Component {

  @service access;
  @service config;

  get cellType() {
    const skill = this.args.skill;
    switch (this.args.section) {
      case 'challenges':
        switch (this.args.view) {
          case 'production':
            if (skill && skill.productionTemplate) {
              return 'production';
            }
            break;
          case 'workbench':
            if (skill) {
              return 'workbench';
            }
            break;
        }
        break;
      case 'skills':
        switch (this.args.skillView) {
          case 'production':
            if (skill) {
              return 'skill';
            } else if (this.access.mayEditSkills()) {
              return 'add-skill';
            }
            break;
          case 'historical' :
            if (skill) {
              return 'historicalSkill';
            }
            break;
        }

        break;
      case 'quality':
        if (skill && skill.productionTemplate) {
          return 'quality';
        }
        break;
      case 'i18n' :
        if (skill  && skill.productionTemplates.length > 0) {
          return 'i18n';
        }
        break;
    }
    return 'empty';
  }
}
