import Component from '@glimmer/component';


export default class CompetenceGridCellSkillWorkbenchComponent extends Component {

  get archivedCount() {
    const skills = this.args.tube.filledDeadSkills[parseInt(this.args.level) - 1];
    if (!skills) {
      return 0;
    }
    const archivedSkill = skills.filter(skill=> skill.isArchived);
    return archivedSkill.length;
  }

  get deletedCount() {
    const skills = this.args.tube.filledDeadSkills[parseInt(this.args.level)  - 1];
    if (!skills) {
      return 0;
    }
    const deletedSkill = skills.filter(skill=> skill.isDeleted);
    return deletedSkill.length;
  }
}
