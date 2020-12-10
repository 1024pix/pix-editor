import Component from '@glimmer/component';
import { action } from '@ember/object';


export default class PopinTubeLevel extends Component {

  get skillsAndSelectedStatus() {
    const skills = this.args.skills;
    const selected = this.args.selectedSkills;
    return skills.reduce((orderedSkills, skill) => {
      const level = skill.level;
      const isSelected = selected.includes(skill.pixId);
      orderedSkills[level - 1] = { skill, isSelected };
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
    const skillIds = this.skillsAndSelectedStatus.reduce((ids, skillAndSelectedStatus) => {
      if (skillAndSelectedStatus && (skillAndSelectedStatus.skill.level <= level)) {
        ids.push(skillAndSelectedStatus.skill.pixId);
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
