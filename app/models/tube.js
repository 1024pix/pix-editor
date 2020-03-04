import classic from 'ember-classic-decorator';
import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import {computed} from '@ember/object';
import {tracked} from '@glimmer/tracking';
@classic
export default class TubeModel extends Model {

  init() {
    this.set('selectedSkills', []);
    return super.init(...arguments);
  }

  @attr name;
  @attr title;
  @attr description;
  @attr practicalTitle;
  @attr practicalDescription;
  @attr pixId;

  @belongsTo('competence') competence;
  @hasMany('skill') rawSkills;

  @tracked selectedLevel = false;

  @computed('rawSkills.[]')
  get skills() {
    return this.get('rawSkills').filter(skill => {
      return skill.get('status') !== 'périmé';
    });
  }

  @computed('skills.[]')
  get skillCount() {
    return this.get('skills').length;
  }

  @computed('sortedSkills.@each.productionTemplate')
  get productionSkills() {
    return this.get('sortedSkills').filter(skill => skill.get('productionTemplate') != null);
  }

  @computed('skills.@each.productionTemplate')
  get productionSkillCount() {
    return this.get('skills').map(skill => skill.get('productionTemplate')).filter(challenge => challenge != null).length;
  }

  @computed('skills.[]')
  get sortedSkills() {
    return this.get('skills').sortBy('level');
  }

  @computed('sortedSkills.{[],@each.level}')
  get filledSkills() {
    return this.get('sortedSkills').reduce((grid, skill) => {
        grid[skill.get('level')-1] = skill;
        return grid;
      },[false, false, false, false, false, false, false]);
  }

  @computed('productionSkillCount')
  get hasProductionChallenge() {
    return this.get('productionSkillCount') > 0;
  }

}
