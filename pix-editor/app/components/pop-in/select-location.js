import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PopinSelectLocation extends Component {

  @tracked enableMoveActionButton = false;

  get titleModal() {
    if (this.args.title) {
      return this.args.title;
    }
    return `Emplacement de ${this.args.name}`;
  }

  get titleButtonAction() {
    if (this.args.isMovingSkill) {
      return 'Copier vers';
    }
    return 'Déplacer';
  }

  /* get enableMoveActionButton() {
    if (this.args.isMovingPrototype) {
      return (this.areSkillsLoaded && !!this._selectedSkill);
    }
    if (this.args.isMovingSkill) {
      return !!this.selectedLevel;
    }
    return true;
  }*/

  @action
  closeModal() {
    this.args.close();
  }

  @action
  setIsSubmitable(value) {
    this.enableMoveActionButton = value;
  }

  @action
  onSubmit(...args) {
    this.args.onChange(...args);
    this.closeModal();
  }
}
