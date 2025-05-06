import { A } from '@ember/array';
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
  setLocation() {
    const competence = this.competences.find((comp) => comp.id === this.selectedCompetence.value);
    if (this.args.isMovingTube) {
      const theme = this.themes.find((theme)=> theme.id === this.selectedTheme.value);
      this.args.onChange(competence, theme);
    }
    if (this.args.isMovingPrototype) {
      this.args.onChange(this._selectedSkill);
    }
    if (this.args.isMovingSkill) {
      const tube = this.tubes.find((tube)=> tube.id === this._selectedTube.value);
      this.args.onChange(competence, tube, this.selectedLevel);
    }
    this.args.close();
    this._reset();
  }

  @action
  closeModal() {
    this._reset();
    this.args.close();
  }
}
