import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class cellSkillLog extends Component {

  @service store

  @tracked skillLoaded = false;

  _skill = null;

  get skill() {
    if (!this.skillLoaded) {
      return this._loadSkill();
    }
    return this._skill;
  }

  _loadSkill() {
    const skillId = this.args.skillId;
    return this.store.query('skill', {
      filterByFormula: `SEARCH('${skillId}', {id persistant})`,
    })
      .then(skill=> {
        const skills = skill.toArray();
        skill = skills.pop();
        this._skill = skill;
        this.skillLoaded = true;
        return skill;
      });
  }
}
