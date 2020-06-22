import Component from '@glimmer/component';
import { convertLanguageAsFlag }  from '../../../helpers/convert-language-as-flag';


export default class CompetenceGridCellI18nComponent extends Component {

  get languagesAndFlags() {
    const languages = this._skillLanguages.sort();
    return languages.map(language => {
      return {language, flag: convertLanguageAsFlag([language])}
    });
  }

  get _skillLanguages() {
    const challenges = this.args.skill.productionChallenges;
    return challenges.reduce((languages, challenge) => {
      if (challenge.languages && challenge.languages.length !== 0) {
        challenge.languages.forEach(language => {
          if (!languages.includes(language)) {
            languages.push(language);
          }
        });
      }
      return languages;
    }, []);
  }
}
