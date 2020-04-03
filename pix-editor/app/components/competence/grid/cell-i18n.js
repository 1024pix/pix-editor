import Component from '@glimmer/component';

export default class CompetenceGridCellI18nComponent extends Component {


  get skillFlags() {
    const languages = this._skillLanguages.sort();
    return languages.map(language => this._flagByLanguage(language));
  }

  get _skillLanguages() {
    const templates = this.args.skill.productionTemplates;
    return templates.reduce((languages, template) => {
      if (!template.language) {
        return languages;
      }
      //todo when alternative.language is alternative.languages
      // if (alternative.languages || alternative.languages.length !== 0) {
      //   alternative.languages.forEach(language=>{
      //     if(!languages.includes(language)){
      //       languages.push(language);
      //     }
      //   });
      // }
      // return languages;
      return languages.includes(template.language) ? languages : [...languages, template.language];
    }, []);
  }

  _flagByLanguage(language) {
    switch (language) {
      case "Francophone" :
        return "fr";
      case "Franco Français":
        return "fr fr-fr";
      case "Anglais":
        return "gb uk";
      case "Espagnol":
        return "es";
      case "Italie":
        return "it";
      case "Allemand":
        return "de";
    }
  }
}
