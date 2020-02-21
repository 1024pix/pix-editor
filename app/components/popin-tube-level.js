import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import Component from '@ember/component';


@classic
export default class PopinTubeLevel extends Component {
  tube = null;

  @computed('tube', 'selectedSkills')
  get skills() {
    let tube = this.get('tube');
    if (tube) {
      const skills = tube.get('productionSkills');
      let selected = this.get('selectedSkills');
      return skills.reduce((orderedSkills, skill) => {
        let level = skill.get('level');
        skill.set('_selected', selected.includes(skill.get('pixId')));
        orderedSkills[level-1] = skill;
        return orderedSkills;
      }, [null, null, null, null, null, null, null, null]);
    } else {
      return [];
    }
  }

  @computed('level')
  get mayUnset() {
    let value = this.get('level');
    return value != false;
  }

  @action
  select(skill) {
    let level = skill.get('level');
    let skillIds = this.get('skills').reduce((ids, skill) => {
      if (skill && (skill.get('level')<=level)) {
        ids.push(skill.get('pixId'));
      }
      return ids;
    }, []);
    this.get('setTubeLevel')(this.get('tube'), level, skillIds);
    this.set('display', false);
  }

  @action
  clear() {
    this.get('clearTube')(this.get('tube'));
    this.set('display', false);
  }

  @action
  closeModal() {
    this.set('display', false);
  }
}
