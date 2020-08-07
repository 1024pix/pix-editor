import Component from '@glimmer/component';


export default class CompetenceGridCellHistoryComponent extends Component {

  get archivedCount() {
    const skills = this.args.tube.filledDeadSkills[this.args.level];
    const archivedSkill = skills.filter(skill=> skill.isArchived);
    return archivedSkill.length;
  }

  get deletedCount() {
    const skills = this.args.tube.filledDeadSkills[this.args.level];
    const deletedSkill = skills.filter(skill=> skill.isDeleted);
    return deletedSkill.length;
  }
}
