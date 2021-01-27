import Component from '@glimmer/component';


export default class CompetenceGridCellSkillWorkbenchComponent extends Component {

  get archivedCount() {
    const archivedSkill = this.args.skills.filter(skill=> skill.isArchived);
    return archivedSkill.length;
  }

  get deletedCount() {
    const deletedSkill = this.args.skills.filter(skill=> skill.isDeleted);
    return deletedSkill.length;
  }

  get draftCount() {
    const draftSkill = this.args.skills.filter(skill=> skill.isDraft);
    return draftSkill.length;
  }

  get haveActiveSkill() {
    const activeSkill = this.args.skills.filter(skill=> skill.isActive);
    return activeSkill.length > 0;
  }

  get haveDraftSkill() {
    return this.draftCount > 0;
  }

  get haveArchivedSkill() {
    return this.archivedCount > 0;
  }

  get haveDeletedSkill() {
    return this.deletedCount > 0;
  }
}
