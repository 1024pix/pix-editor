import { Textarea } from '@ember/component';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { not } from 'ember-truth-helpers';
import Select from 'pixeditor/components/field/select';

const statusList = [
  {
    label: 'en cours',
    value: 'PENDING',
  },
  {
    label: 'terminé',
    value: 'FINISHED',
  },
  {
    label: 'archive',
    value: 'ARCHIVED',
  },
];

// TRADUCTIONS PIXSELECT
const selectTranslationList = {
  placeholder: 'Choisir un statut',
};

export default class NoteForm extends Component {
  @tracked status;

  get currentStatus() {
    if (this.status) {
      return this.status.value;
    }

    if (this.args.entry.status) {
      return statusList.find((status) => status.label === this.args.entry.status).value;
    }

    return null;
  }

  get texts() {
    return {
      placeholder: 'Choisir un statut',
    };
  }

  @action
  setStatus(selectedValue) {
    const selectedStatus = statusList.find((status) => status.value === selectedValue);
    this.args.entry.status = selectedStatus.label;
    this.status = selectedStatus;
  }

  <template>
    <div class="ui content">
      <form class="ui form">
        <div class="field">
          <Select
            @hideDefaultOption={{true}}
            @options={{statusList}}
            @onChange={{this.setStatus}}
            @value={{this.currentStatus}}
            @isDisabled={{not @edition}}
            @texts={{selectTranslationList}}
          >
            <:label>Statut</:label>
          </Select>
        </div>
        <div class="field {{if @edition '' 'disabled'}}">
          <label for="note">Texte</label>
          <div class="ui input">
            <Textarea id="note" @value={{@entry.text}} rows="4" readonly={{not @edition}} />
          </div>
        </div>
      </form>
    </div>
    <div class="actions">
      <button class="ui right button" {{on "click" @close}} type="button">
        Retour
      </button>
      {{#if @edition}}
        <button class="ui green right button" {{on "click" @save}} type="button">
          Enregistrer
        </button>
      {{else}}
        {{#if @mayEdit}}
          <button class="ui green right button" {{on "click" @edit}} type="button">
            Modifier
          </button>
        {{/if}}
      {{/if}}
    </div>
  </template>
}
