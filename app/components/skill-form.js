import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';

@classic
export default class SkillForm extends Component {
  displayTutorialForm = false;
  searchTitle = '';

  init() {
    super.init(...arguments);
    this.options = {
      'clueStatus': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé", "inapplicable"],
      'descriptionStatus': ["Proposé", "Validé", "pré-validé", "à soumettre", "à retravailler", "archivé"],
      'i18n': ["France", "Monde", "Union Européenne"]
    };
    this.set('tutorials', []);
  }

  @action
  openCreateTutorialModal(tutorials, title) {
    this.set('searchTitle', title);
    this.set('tutorials',tutorials);
    this.set('displayTutorialForm', true)
  }
}
