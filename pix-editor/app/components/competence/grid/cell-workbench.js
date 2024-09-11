import Component from '@glimmer/component';

export default class CellWorkbench extends Component {

  get validatedPrototype() {
    return this.args.skill.validatedPrototypesCount === 1;
  }

  get draftPrototypesCount() {
    return this.args.skill.proposedPrototypesCount;
  }

  get archivedPrototypesCount() {
    return this.args.skill.archivedPrototypesCount;
  }

  get obsoletePrototypesCount() {
    return this.args.skill.obsoletePrototypesCount;
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
