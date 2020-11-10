import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PopinThresholdCalculation extends Component {
  @tracked selectedSkills = [];

  constructor() {
    super(...arguments);
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
          this.selectedSkills.push(skill);
        }
      });
    });
  }

  get skillsSelected() {
    return this.selectedSkills;
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
