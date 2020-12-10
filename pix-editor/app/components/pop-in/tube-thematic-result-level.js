import Component from '@glimmer/component';
import { action } from '@ember/object';


export default class PopinThematicResultTubeLevel extends Component {

  get skillsAndThematicResult() {
    const tube = this.args.tube;
    const selectedTubeLevel = tube.selectedLevel;
    const skills = tube.productionSkills;
    return skills.reduce((orderedSkills, skill) => {
      const level = skill.level;
      if (level <= selectedTubeLevel) {
        const isThematicResult = this._isSelectedThematicResultSkill(level);
        orderedSkills[level - 1] = {skill, isThematicResult};
      }
      return orderedSkills;
    }, [null, null, null, null, null, null, null, null]);
  }

  get mayUnset() {
    const tube = this.args.tube;
    return tube.selectedThematicResultLevel !== false;
  }

  @action
  select(skill) {
    const tube = this.args.tube;
    tube.selectedThematicResultLevel = skill.level;
    this.closeModal();
  }

  @action
  clear() {
    const tube = this.args.tube;
    tube.selectedThematicResultLevel = false;
    this.closeModal();
  }

  @action
  closeModal() {
    this.args.close();
  }

  _isSelectedThematicResultSkill(level) {
    const tube = this.args.tube;
    return level <= tube.selectedThematicResultLevel;
  }
}
