import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class PopinThresholdCalculation extends Component {

  get selectedSkills() {
    const selectedSkills = [];
    const areas = this.args.model;
    const selectedTubes = [];
    areas.forEach(area => {
      area.sortedCompetences.forEach(competence => {
        competence.productionTubes.forEach(tube => {
          if (tube.selectedLevel) {
            selectedTubes.push(tube);
          }
        });
      });
    });
    selectedTubes.forEach(tube => {
      tube.liveSkills.forEach(skill => {
        if (skill.isActive && skill.level <= tube.selectedLevel) {
          selectedSkills.push(skill);
        }
      });
    });
    return selectedSkills;
  }

  get selectedSkillsCount() {
    return this.selectedSkills.length;
  }

  get selectedSkillsLevels() {
    const levels = [];
    this.selectedSkills.forEach(skill=>{
      if (!levels.includes(skill.level)) {
        levels.push(skill.level);
      }
    });
    return levels.sort();
  }

  @action
  closeModal() {
    this.args.close();
  }
}
