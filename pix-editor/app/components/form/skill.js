import Component from '@glimmer/component';

export default class SkillForm extends Component {
  searchTitle = '';
  options = {
    'clueStatus': ['Proposé', 'Validé', 'pré-validé', 'à soumettre', 'à retravailler', 'archivé', 'inapplicable'],
    'descriptionStatus': ['Proposé', 'Validé', 'pré-validé', 'à soumettre', 'à retravailler', 'archivé'],
    'i18n': ['France', 'Monde', 'Union Européenne'],
  };

  async addTutorial(tutorials, tutorial) {
    const loadedTutorials = await tutorials;
    loadedTutorials.push(tutorial);
  }

  async removeTutorial(tutorials, tutorial) {
    const loadedTutorials = await tutorials;
    loadedTutorials.removeObject(tutorial);
  }

}
