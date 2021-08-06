import Component from '@glimmer/component';


export default class CompetenceGridCellSkillComponent extends Component {

  get hasNoClueByLanguage() {
    switch (this.args.languageFilter) {
      case 'fr':
      case 'fr-fr':
        return !this.args.skill.clue;
      case 'en':
        return !this.args.skill.clueEn;
      default :
        return true;
    }
  }

  get alertCSS() {
    if (!this.args.languageFilter) {
      return '';
    }
    if (this.tutoMoreCountByLanguage + this.tutoSolutionCountByLanguage === 0) {
      return 'danger';
    }
    if (this.tutoMoreCountByLanguage === 0 || this.tutoSolutionCountByLanguage === 0) {
      return 'warning';
    }
    return '';
  }

  get tutoMoreCountByLanguage() {
    return this._getTutorialsCountByLanguage(this.args.skill.tutoMore);
  }

  get tutoSolutionCountByLanguage() {
    return this._getTutorialsCountByLanguage(this.args.skill.tutoSolution);
  }

  _getTutorialsCountByLanguage(tutorials) {
    const languageFilter = this.args.languageFilter;
    if (languageFilter) {
      const filteredTutorials = tutorials.filter(tutorial => {
        const language = this._convertLanguageFilterToLanguageTutorial(languageFilter);
        return tutorial.language === language;
      });
      return filteredTutorials.length;
    }
    return tutorials.length;
  }

  _convertLanguageFilterToLanguageTutorial(language) {
    switch (language) {
      case 'fr' :
        return 'fr-fr';
      case 'en':
        return 'en-us';
      default :
        return language;
    }
  }
}
