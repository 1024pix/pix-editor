import { concat } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import and from 'ember-truth-helpers/helpers/and';
import or from 'ember-truth-helpers/helpers/or';

export default class CompetenceGridCellSkillComponent extends Component {
  <template>
    <td class="skill-cell skill-mode {{this.alertCSS}}">
      <LinkTo @route="authenticated.competence.skills.single" @model={{@skill}} class="skill-cell__link">
        <div class="skill-name">
          {{@skill.name}}
        </div>
        <div class="help">
          {{#if (and @languageFilter this.hasNoClueByLanguage)}}
            <i class="idea icon empty" title="Indice manquant"></i>
          {{else if @languageFilter}}
            <i class="idea icon validated" title="Indice présent"></i>
          {{else if (or @skill.clue @skill.clueNA)}}
            <i class={{concat "idea icon " @skill.clueCSS}} title="Indice {{@skill.clueStatus}}"></i>
          {{/if}}
          <span class="tuto-count">
            <span title="Nombre de tutoriels pour réussir la prochaine fois">{{this.tutoSolutionCountByLanguage}}</span>
            -
            <span title="Nombre de tutoriels pour en savoir plus">{{this.tutoMoreCountByLanguage}}</span>
          </span>
        </div>
      </LinkTo>
    </td>
  </template>

  get hasNoClueByLanguage() {
    switch (this.args.languageFilter) {
      case 'fr':
      case 'fr-fr':
        return !this.args.skill.clue;
      case 'en':
        return !this.args.skill.clueEn;
      default:
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
    const tutoMoreArray = this.args.skill.hasMany('tutoMore')?.value() || [];
    return this._getTutorialsCountByLanguage(tutoMoreArray);
  }

  get tutoSolutionCountByLanguage() {
    const tutoSolutionArray = this.args.skill.hasMany('tutoSolution')?.value() || [];
    return this._getTutorialsCountByLanguage(tutoSolutionArray);
  }

  _getTutorialsCountByLanguage(tutorials) {
    const languageFilter = this.args.languageFilter;
    if (languageFilter) {
      const filteredTutorials = tutorials.filter((tutorial) => {
        const language = this._convertLanguageFilterToLanguageTutorial(languageFilter);
        return tutorial.language === language;
      });
      return filteredTutorials.length;
    }
    return tutorials.length;
  }

  _convertLanguageFilterToLanguageTutorial(language) {
    switch (language) {
      case 'fr':
        return 'fr-fr';
      case 'en':
        return 'en-us';
      default:
        return language;
    }
  }
}
