import classic from 'ember-classic-decorator';
import { tagName } from '@ember-decorators/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
@tagName("")
export default class GridCell extends Component {
  @service
  access;

  @service
  config;

  // Props
  skill = null;

  view = null;
  productionTemplate = null;
  hasStatusProduction = false;

  // Computed
  @computed('section', 'config.access')
  get mayAddSkill() {
    return this.get('section') === 'skills' && this.get('access').mayEditSkills();
  }

  @computed(
    'skill',
    'skill.{productionTemplate,productionTemplate.isFulfilled}',
    'hasStatusProduction',
    'section',
    'view'
  )
  get displaySkill() {
    const skill = this.get('skill');
    if(skill){
      const section = this.get('section');
      const view = this.get('view');
      const productionTemplate = this.get('skill.productionTemplate');
      switch(section) {
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
