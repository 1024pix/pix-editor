import Component from '@glimmer/component';

export default class SkillForm extends Component {
  searchTitle = '';
  options = {
    'clueStatus': ['Proposé', 'Validé', 'pré-validé', 'à soumettre', 'à retravailler', 'archivé', 'inapplicable'],
    'descriptionStatus': ['Proposé', 'Validé', 'pré-validé', 'à soumettre', 'à retravailler', 'archivé'],
    'i18n': ['France', 'Monde', 'Union Européenne']
  };

  addTutorial(tutorials, tutorial) {
    // not a very best practice to update list from here...
    console.log('add tutorial');
    tutorials.pushObject(tutorial);
  }

  removeTutorial(tutorials, tutorial) {
    // not a very best practice to update list from here...
    tutorials.removeObject(tutorial);
  }

}
