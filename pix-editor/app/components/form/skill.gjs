import { action } from '@ember/object';
import Component from '@glimmer/component';
import { not } from 'ember-truth-helpers';
import Input from 'pixeditor/components/field/input';
import Quality from 'pixeditor/components/field/quality';
import Select from 'pixeditor/components/field/select';
import Textarea from 'pixeditor/components/field/textarea';
import Tutorials from 'pixeditor/components/field/tutorials';

const descriptionStatusList = [
  {
    label: 'Proposé',
    value: 'Proposé',
  },
  {
    label: 'Validé',
    value: 'Validé',
  },
  {
    label: 'pré-validé',
    value: 'pré-validé',
  },
  {
    label: 'à soumettre',
    value: 'à soumettre',
  },
  {
    label: 'à retravailler',
    value: 'à retravailler',
  },
  {
    label: 'archivé',
    value: 'archivé',
  },
];
const clueStatusList = [...descriptionStatusList, { label: 'inapplicable', value: 'inapplicable' }];
const i18nOptionList = [
  { label: 'France', value: 'France' },
  { label: 'Monde', value: 'Monde' },
  { label: 'Union Européenne', value: 'Union Européenne' },
];

export default class SkillForm extends Component {
  @action
  setDescriptionStatus(value) {
    this.args.skill.descriptionStatus = value;
  }

  @action
  setClueStatus(value) {
    this.args.skill.clueStatus = value;
  }

  @action
  setI18n(value) {
    this.args.skill.i18n = value;
  }

  async addTutorial(tutorials, tutorial) {
    const loadedTutorials = await tutorials;
    loadedTutorials.push(tutorial);
  }

  async removeTutorial(tutorials, tutorial, event) {
    event.preventDefault();

    const loadedTutorials = await tutorials;
    const index = loadedTutorials.indexOf(tutorial);
    if (index !== -1) {
      loadedTutorials.splice(index, 1);
    }
  }

  <template>
    <form action="" class="ui form">
      <Textarea @title="Description" @value={{@skill.description}} @edition={{@edition}} @id="skill-description" />
      <Select
        @id="select-description-status"
        @value={{@skill.descriptionStatus}}
        @options={{descriptionStatusList}}
        @isDisabled={{not @edition}}
        @onChange={{this.setDescriptionStatus}}
        @hideDefaultOption={{true}}
      >
        <:label>Statut de la description</:label>
      </Select>
      <Textarea @title="Indice (fr)" @value={{@skill.clue}} @edition={{@edition}} @id="skill-clue-fr" />
      <Textarea @title="Indice (en)" @value={{@skill.clueEn}} @edition={{@edition}} @id="skill-clue-en" />
      <Select
        @id="select-clue-status"
        @value={{@skill.clueStatus}}
        @options={{clueStatusList}}
        @isDisabled={{not @edition}}
        @onChange={{this.setClueStatus}}
        @hideDefaultOption={{true}}
      >
        <:label>Statut de l'indice</:label>
      </Select>
      {{#if @skill.productionPrototype}}
        <Quality @title="Qualité" @challenge={{@skill.productionPrototype}} @edition={{@edition}} />
      {{/if}}
      <Tutorials
        @title="Pour réussir la prochaine fois"
        @skill={{@skill}}
        @tutorials={{@skill.tutoSolution}}
        @searchClass="solution"
        @edition={{@edition}}
        @addTutorial={{this.addTutorial}}
        @removeTutorial={{this.removeTutorial}}
      />
      <Tutorials
        @title="Pour en savoir plus"
        @skill={{@skill}}
        @tutorials={{@skill.tutoMore}}
        @edition={{@edition}}
        @searchClass="more"
        @addTutorial={{this.addTutorial}}
        @removeTutorial={{this.removeTutorial}}
      />
      <Select
        @id="select-i18n-option"
        @value={{@skill.i18n}}
        @options={{i18nOptionList}}
        @isDisabled={{not @edition}}
        @onChange={{this.setI18n}}
        @hideDefaultOption={{true}}
      >
        <:label>Internationalisation</:label>
      </Select>
      {{#unless @edition}}
        <Input @value={{@skill.pixId}} @title="Id" @edition={{false}} />
      {{/unless}}
    </form>
  </template>
}
