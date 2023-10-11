import Component from '@glimmer/component';

export default class CellWorkbench extends Component {

  get prototypes() {
    return this.args.skills.map(skill => skill.prototypes).flat();
  }

  get loadingChallenges() {
    return this.args.skills.some(skill => skill.challenges.isPending);
  }

  get validatedPrototype() {
    return this.prototypes.find(prototype => prototype.isValidated);
  }

  get draftPrototypesCount() {
    const draftPrototypes = this.prototypes.filter(prototype => prototype.isDraft);
    return draftPrototypes.length;
  }

  get archivedPrototypesCount() {
    const archivedPrototypes = this.prototypes.filter(prototype => prototype.isArchived);
    return archivedPrototypes.length;
  }

  get obsoletePrototypesCount() {
    const obsoletePrototypes = this.prototypes.filter(prototype => prototype.isObsolete);
    return obsoletePrototypes.length;
  }

  get hasDraftPrototypes() {
    return this.draftPrototypesCount > 0;
  }

  get hasArchivedPrototypes() {
    return this.archivedPrototypesCount > 0;
  }

  get hasObsoletePrototypes() {
    return this.obsoletePrototypesCount > 0;
  }
}
