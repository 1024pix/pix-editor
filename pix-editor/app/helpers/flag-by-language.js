import Ember from 'ember';

export function flagByLanguage(language) {
    switch (language[0]) {
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

export default Ember.Helper.helper(flagByLanguage);
