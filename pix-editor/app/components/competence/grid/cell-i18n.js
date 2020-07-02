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
    const challenges = this.args.skill.validatedChallenges;
    return challenges.reduce((languages, challenge) => {
      return this._extractLanguagesFromChallenge(challenge.languages,languages);
    }, []);
  }

  _extractLanguagesFromChallenge(challengeLanguages, extractedLanguages){
    if (challengeLanguages && challengeLanguages.length !== 0) {
      challengeLanguages.forEach(language => {
        if (!extractedLanguages.includes(language)) {
          extractedLanguages.push(language);
        }
      });
    }
    return extractedLanguages;
  }
}
