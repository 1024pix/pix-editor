import Component from '@glimmer/component';

export default class CompetenceGridTube extends Component {

  get skills() {
    switch (this.args.view) {
      case 'workbench': return this.atelierSkillViews;
      case 'draft': return this.enConstructionSkillViews;
      default: return this.enProductionSkillViews;
    }
  }

  get atelierSkillViews() {
    return this.args.tube.atelierSkillViews.reduce(setSkillsByLevel, buildEmptySkillsArray());
  }

  get enConstructionSkillViews() {
    return this.args.tube.enConstructionSkillViews.reduce(setSkillsByLevel, buildEmptySkillsArray());
  }

  get enProductionSkillViews() {
    return this.args.tube.enProductionSkillViews.reduce(setSkillsByLevel, buildEmptySkillsArray());
  }
}

function setSkillsByLevel(skills, skill) {
  skills[skill.level - 1] = skill;
  return skills;
}

function buildEmptySkillsArray() {
  return new Array(7).fill(false);
}
