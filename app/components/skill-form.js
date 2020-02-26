import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SkillForm extends Component {
  displayTutorialForm = false;
  searchTitle = '';
  options = {
    'clueStatus': ['Proposé', 'Validé', 'pré-validé', 'à soumettre', 'à retravailler', 'archivé', 'inapplicable'],
    'descriptionStatus': ['Proposé', 'Validé', 'pré-validé', 'à soumettre', 'à retravailler', 'archivé'],
    'i18n': ['France', 'Monde', 'Union Européenne']
  };
  tutorials = [];

  @action
  openCreateTutorialModal(title) {
    this.searchTitle = title;
    this.tutorials = this.args.skill.tutorials;
    this.displayTutorialForm = true;
  }

  addTutorial(tutorials, tutorial) {
    // not a very best practice to update list from here...
    tutorials.pushObject(tutorial);
  }

  removeTutorial(tutorials, tutorial) {
    // not a very best practice to update list from here...
    tutorials.removeObject(tutorial);
  }

}
