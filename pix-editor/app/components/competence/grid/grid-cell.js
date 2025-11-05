import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class GridCell extends Component {
  @service access;
  @service config;

  get cellType() {
    const { skill, skillOverview } = this.args;
    switch (this.args.section) {
      case 'challenges':
        switch (this.args.view) {
          case 'production':
            if (skillOverview) {
              return 'production';
            }
            break;
          case 'workbench':
            if (skillOverview) {
              return 'workbench';
            }
            break;
        }
        break;
      case 'skills':
        switch (this.args.view) {
          case 'production':
            if (skill) {
              return 'skill';
            }
            break;
          case 'workbench':
            if (skill) {
              return 'skill-workbench';
            } else if (this.access.mayEditSkills()) {
              return 'add-skill';
            }
            break;
          case 'draft':
            if (skill) {
              return 'skill-draft';
            } else if (this.access.mayEditSkills()) {
              return 'add-skill';
            }
            break;
        }
        break;
      case 'quality':
        if (skill) {
          return 'quality';
        }
        break;
    }
    return 'empty';
  }

  get skillLevel() {
    return this.args.index + 1;
  }
}
