import Component from '@glimmer/component';
import {action} from '@ember/object';


export default class PopinTubeLevel extends Component {

  get skills() {
    const tube = this.args.tube;
    const skills = tube.get('productionSkills');
    const selected = this.args.selectedSkills;
    return skills.reduce((orderedSkills, skill) => {
      const level = skill.level;
      skill._selected = selected.includes(skill.pixId);
      orderedSkills[level - 1] = skill;
      return orderedSkills;
    }, [null, null, null, null, null, null, null, null]);
  }

  get mayUnset() {
    const value = this.args.level;
    return value != false;
  }

  @action
  select(skill) {
    const level = skill.level;
    const skillIds = this.skills.reduce((ids, skill) => {
      if (skill && (skill.level <= level)) {
        ids.push(skill.pixId);
      }
      return ids;
    }, []);
    this.args.setTubeLevel(this.args.tube, level, skillIds);
    this.closeModal();
  }

  @action
  clear() {
    this.args.clearTube(this.args.tube);
    this.closeModal();
  }

  @action
  closeModal() {
    this.args.close();
  }
}
