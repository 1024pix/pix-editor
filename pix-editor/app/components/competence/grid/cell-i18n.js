import Component from '@glimmer/component';

export default class CompetenceGridCellI18nComponent extends Component {


  get skillFlags() {
    const languages = this._skillLanguages.sort();
    return languages.reduce((flags, language) => {
      return [...flags, this._flagByLanguage(language)]
    }, [])
  }

  get _skillLanguages() {
    const alternatives = this.args.skill.alternatives;
    return alternatives.reduce((languages, alternative) => {
      if (!alternative.language) {
        return languages;
      }
      return languages.includes(alternative.language) ? languages : [...languages, alternative.language];
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
