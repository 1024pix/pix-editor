import Component from '@glimmer/component';

export default class CompetenceGridCellSkillComponent extends Component {

  get skill() {
    return this.args.skill;
  }

  get isApplicableHint() {
    return this.skill.hintStatus !== 'inapplicable';
  }

  get isFrenchFilteredLanguage() {
    return ['fr', 'fr-fr'].includes(this.args.languageFilter);
  }

  get hasNoHint() {
    return !!this.skill.hint;
  }

  get alertCSS() {
    if (this.tutoMoreCountByLanguage + this.tutoSolutionCountByLanguage === 0) {
      return 'danger';
    }
    if (this.tutoMoreCountByLanguage === 0 || this.tutoSolutionCountByLanguage === 0) {
      return 'warning';
    }
    return '';
  }

  get tutoMoreCountByLanguage() {
    return this.skill.learningMoreTutorialsCount;
  }

  get tutoSolutionCountByLanguage() {
    return this.skill.tutorialsCount;
  }
}
