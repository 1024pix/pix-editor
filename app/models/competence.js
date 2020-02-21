import classic from 'ember-classic-decorator';
import {computed} from '@ember/object';
import Model, { attr, hasMany } from '@ember-data/model';

@classic
export default class CompetenceModel extends Model {
  needsRefresh = false;

  @attr('string', { readOnly: true }) name;
  @attr title;
  @attr code;
  @attr description;
  @attr pixId;

  @hasMany('tube') rawTubes;

  @computed('rawTubes.[]')
  get tubes() {
    return this.get('rawTubes').filter(tube => {
      return tube.get('name') !== '@workbench';
    });
  }

  @computed('rawTubes.[]')
  get productionTubes() {
    let allTubes = this.get('rawTubes');
    allTubes = allTubes.filter(tube => tube.get('hasProductionChallenge'));
    return allTubes.sortBy('name');
  }

  @computed('tubes.[]')
  get sortedTubes() {
    return this.get('tubes').sortBy('name');
  }

  @computed('tubes')
  get tubeCount() {
    return this.get('tubes').length;
  }

  @computed('productionTubes')
  get productionTubeCount() {
    return this.get('productionTubes').length;
  }

  @computed('productionTubes.@each.selectedLevel')
  get selectedProductionTubeCount(){
    return this.get('productionTubes').filter(tube => tube.get('selectedLevel')).length;
  }

  @computed('tubes.@each.skillCount')
  get skillCount() {
    return this.get('tubes').map(tube => tube.get('skillCount')).reduce((count, value)=> {
      return count+value;
    },0);
  }

  @computed('tubes.@each.productionSkillCount')
  get productionSkillCount() {
    return this.get('tubes').map(tube => tube.get('productionSkillCount')).reduce((count, value)=> {
      return count+value;
    },0);
  }

  @computed('rawTubes')
  get workbenchSkill() {
    const workbenchTube = this.get('rawTubes').find(tube => {
      return tube.get('name') === '@workbench';
    });
    if (workbenchTube) {
      return workbenchTube.get('rawSkills').get('firstObject');
    }
    return null;
  }

  @computed('workbenchSkill', 'workbenchSkill.templates.{[],@each.status}')
  get workbenchTemplates() {
    const workbenchSkill = this.get('workbenchSkill');
    if (workbenchSkill)
    return workbenchSkill.get('templates').filter(template => {
      return !template.get('isArchived');
    });
    return [];
  }
}
