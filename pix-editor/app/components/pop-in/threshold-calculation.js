import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PopinThresholdCalculation extends Component {
  @tracked selectedSkills = [];
  @tracked selectedSkillsMaxLevel1Count;
  @tracked selectedSkillsMaxLevel2Count;
  @tracked selectedSkillsMaxLevel3Count;
  @tracked selectedSkillsMaxLevel4Count;
  @tracked selectedSkillsMaxLevel5Count;
  @tracked selectedSkillsMaxLevel6Count;
  @tracked selectedSkillsMaxLevel7Count;
  @tracked selectedSkillsMaxLevel8Count;

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

  get selectedSkillsCount() {
    return this.selectedSkills.length;
  }

  get selectedSkillsLevel1Count() {
    return this._selectedSkillsCountByLevel(1);
  }

  get thresholdLevel1() {
    this.selectedSkillsMaxLevel1Count = this.selectedSkillsLevel1Count;
    return Math.round(this.selectedSkillsMaxLevel1Count / this.selectedSkills.length * 100);
  }

  get selectedSkillsLevel2Count() {
    return this._selectedSkillsCountByLevel(2);
  }

  get thresholdLevel2() {
    this.selectedSkillsMaxLevel2Count = this.selectedSkillsLevel2Count + this.selectedSkillsMaxLevel1Count;
    return Math.round(this.selectedSkillsMaxLevel2Count / this.selectedSkills.length * 100);
  }

  get selectedSkillsLevel3Count() {
    return this._selectedSkillsCountByLevel(3);
  }

  get thresholdLevel3() {
    this.selectedSkillsMaxLevel3Count = this.selectedSkillsLevel3Count + this.selectedSkillsMaxLevel2Count;
    return Math.round(this.selectedSkillsMaxLevel3Count / this.selectedSkills.length * 100);
  }

  get selectedSkillsLevel4Count() {
    return this._selectedSkillsCountByLevel(4);
  }

  get thresholdLevel4() {
    this.selectedSkillsMaxLevel4Count = this.selectedSkillsLevel4Count + this.selectedSkillsMaxLevel3Count;
    return Math.round(this.selectedSkillsMaxLevel4Count / this.selectedSkills.length * 100);
  }

  get selectedSkillsLevel5Count() {
    return this._selectedSkillsCountByLevel(5);
  }

  get thresholdLevel5() {
    this.selectedSkillsMaxLevel5Count = this.selectedSkillsLevel5Count + this.selectedSkillsMaxLevel4Count;
    return Math.round(this.selectedSkillsMaxLevel5Count / this.selectedSkills.length * 100);
  }

  get selectedSkillsLevel6Count() {
    return this._selectedSkillsCountByLevel(6);
  }

  get thresholdLevel6() {
    this.selectedSkillsMaxLevel6Count = this.selectedSkillsLevel6Count + this.selectedSkillsMaxLevel5Count;
    return Math.round(this.selectedSkillsMaxLevel6Count / this.selectedSkills.length * 100);
  }

  get selectedSkillsLevel7Count() {
    return this._selectedSkillsCountByLevel(7);
  }

  get thresholdLevel7() {
    this.selectedSkillsMaxLevel7Count = this.selectedSkillsLevel7Count + this.selectedSkillsMaxLevel6Count;
    return Math.round(this.selectedSkillsMaxLevel7Count / this.selectedSkills.length * 100);
  }

  get selectedSkillsLevel8Count() {
    return this._selectedSkillsCountByLevel(8);
  }

  get thresholdLevel8() {
    this.selectedSkillsMaxLevel8Count = this.selectedSkillsLevel8Count + this.selectedSkillsMaxLevel7Count;
    return Math.round(this.selectedSkillsMaxLevel8Count / this.selectedSkills.length * 100);
  }

  _selectedSkillsCountByLevel(level) {
    const skillsByLevel = this.selectedSkills.filter(skill => {
      return skill.level === level;
    });
    return skillsByLevel.length;
  }

  @action
  closeModal() {
    this.args.close();
  }
}
