import Component from '@glimmer/component';

export default class ThresholdRow extends Component {
  <template>
    <tr>
      <td>Équivalent niveau {{@level}}</td>
      <td data-test-threshold>{{this.threshold}}%</td>
      <td data-test-skill-count>{{this.skillsCountByLevel}}</td>
    </tr>
  </template>

  get skillsCountByLevel() {
    const skills = this.args.selectedSkills;
    const skillsByLevel = skills.filter((skill) => {
      return skill.level === this.args.level;
    });
    return skillsByLevel.length;
  }

  get skillsCountByLevelMax() {
    const skills = this.args.selectedSkills;
    const skillsByLevel = skills.filter((skill) => {
      return skill.level <= this.args.level;
    });
    return skillsByLevel.length;
  }

  get threshold() {
    return Math.round((this.skillsCountByLevelMax / this.args.selectedSkills.length) * 100);
  }
}
