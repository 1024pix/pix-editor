import Component from '@glimmer/component';

export default class CompetenceGridCellI18nComponent extends Component {

  get languagesAndFlags() {
    const languages = this._skillLanguages.sort();
    return languages.map(language => {
      return {language, flag: this._convertLanguageAsFlag(language)}
    });
  }

  get _skillLanguages() {
    const templates = this.args.skill.productionTemplates;
    return templates.reduce((languages, template) => {
      if (template.languages && template.languages.length !== 0) {
        template.languages.forEach(language => {
          if (!languages.includes(language)) {
            languages.push(language);
          }
        });
      }
      return languages;
    }, []);
  }

   _convertLanguageAsFlag(language) {
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
