import Component from '@glimmer/component';

export default class CellWorkbench extends Component {

  get prototypes() {
    return this.args.skills.map(skill => skill.prototypes).flat();
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

  get deletedPrototypesCount() {
    const deletedPrototypes = this.prototypes.filter(prototype => prototype.isDeleted);
    return deletedPrototypes.length;
  }

  get haveDraftPrototypes() {
    return this.draftPrototypesCount > 0;
  }

  get haveArchivedPrototypes() {
    return this.archivedPrototypesCount > 0;
  }

  get haveDeletedPrototypes() {
    return this.deletedPrototypesCount > 0;
  }
}
