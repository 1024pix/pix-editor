import Component from '@glimmer/component';

export default class ThresholdRow extends Component {
  get skillsCountByLevel() {
    const skills = this.args.selectedSkills;
    const skillsByLevel = skills.filter(skill => {
      return skill.level === this.args.level;
    });
    return skillsByLevel.length;
  }

  get skillsCountByLevelMax() {
    const skills = this.args.selectedSkills;
    const skillsByLevel = skills.filter(skill => {
      return skill.level <= this.args.level;
    });
    return skillsByLevel.length;
  }

  get threshold() {
    return Math.round(this.skillsCountByLevelMax / this.args.selectedSkills.length * 100);
  }
}
