import Component from '@glimmer/component';
import {convertLanguageAsFlag}  from '../../../helpers/convert-language-as-flag';


export default class CompetenceGridCellI18nComponent extends Component {

  get languagesAndFlags() {
    const languages = this.args.skill.languages;
    return languages.map(language => {
      return {language, flag: convertLanguageAsFlag([language])};
    });
  }
}
