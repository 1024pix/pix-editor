import Component from '@glimmer/component';


export default class CompetenceGridCellHistoricalComponent extends Component {

  get firstSkill() {
    const skills = this.args.skills;
    return skills[0];
  }

  get archivedCount() {
    const skills = this.args.skills;
    const archivedSkill = skills.filter(skill=> skill.isArchived);
    return archivedSkill.length;
  }

  get deletedCount() {
    const skills = this.args.skills;
    const deletedSkill = skills.filter(skill=> skill.isDeleted);
    return deletedSkill.length;
  }
}
