import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PopinPDFEntries extends Component {
  options = {
    language: [{ value:'en',label:'Anglais' }, { value:'fr',label:'Français' }],
  };

  @tracked title = 'Liste des thèmes et des sujets abordés dans Pix';
  @tracked language = false;

  get selectedLanguage() {
    if (this.language) {
      return this.language;
    }
    return this.options.language.find(option => option.value === 'fr');
  }

  @action
  setLanguage(language) {
    this.language = language;
  }

  @action
  validate(e) {
    e.preventDefault();
    this.args.validateAction(this.title, this.selectedLanguage.value);
    this.closeModal();
  }

  @action
  closeModal() {
    this.args.close();
  }
}
