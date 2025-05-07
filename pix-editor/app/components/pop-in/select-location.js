import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class PopinSelectLocation extends Component {
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

  get enableMoveActionButton() {
    if (this.args.isMovingTube) {
      return this.themesLoaded && !!this._selectedTheme;
    }
    if (this.args.isMovingPrototype) {
      return (this.areSkillsLoaded && !!this._selectedSkill);
    }
    if (this.args.isMovingSkill) {
      return !!this.selectedLevel;
    }
    return true;
  }

  @action
  closeModal() {
    this.args.close();
  }

  @action
  onSubmit(...args) {
    this.args.onChange(...args);
    this.closeModal();
  }
}
