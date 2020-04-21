import { helper } from '@ember/component/helper';

export default helper(function convertLanguageAsFlag([language]) {
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
});
