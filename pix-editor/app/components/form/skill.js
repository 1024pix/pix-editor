import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SkillForm extends Component {
  descriptionStatusList = [
    {
      label: 'Proposé',
      value: 'Proposé',
    }, {
      label: 'Validé',
      value: 'Validé',
    }, {
      label: 'pré-validé',
      value: 'pré-validé',
    }, {
      label: 'à soumettre',
      value: 'à soumettre',
    }, {
      label: 'à retravailler',
      value: 'à retravailler',
    }, {
      label: 'archivé',
      value: 'archivé',
    },
  ];
  clueStatusList = [ ...this.descriptionStatusList, { label: 'inapplicable', value: 'inapplicable' }];
  i18nOptionList = [{ label: 'France', value: 'France' }, { label: 'Monde', value: 'Monde' }, { label: 'Union Européenne', value: 'Union Européenne' }];

  @action
  setDescriptionStatusId(value) {
    this.args.skill.descriptionStatus = value;
  }

  @action
  setClueStatusId(value) {
    this.args.skill.clueStatus = value;
  }

  @action
  setI18nOptionId(value) {
    this.args.skill.i18n = value;
  }

  async addTutorial(tutorials, tutorial) {
    const loadedTutorials = await tutorials;
    loadedTutorials.push(tutorial);
  }

  async removeTutorial(tutorials, tutorial, event) {
    event.preventDefault();

    const loadedTutorials = await tutorials;
    loadedTutorials.removeObject(tutorial);
  }

}
