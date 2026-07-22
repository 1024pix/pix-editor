import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { Textarea } from '@ember/component';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { not } from 'ember-truth-helpers';

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

  @action
  setStatus(selectedValue) {
    const selectedStatus = statusList.find((status) => status.value === selectedValue);
    this.args.entry.status = selectedStatus.label;
    this.status = selectedStatus;
  }

  <template>
    <div class="note-form">
      <form class="form">
        <div class="field">
          <PixSelect
            @placeholder="Choisir un statut"
            @hideDefaultOption={{true}}
            @options={{statusList}}
            @onChange={{this.setStatus}}
            @value={{this.currentStatus}}
            @isDisabled={{not @edition}}
          >
            <:label>
              Statut
            </:label>
          </PixSelect>
        </div>
        <div class="field {{if @edition '' 'disabled'}}">
          <label for="note">Texte</label>
          <div class="input">
            <Textarea id="note" @value={{@entry.text}} rows="4" readonly={{not @edition}} />
          </div>
        </div>
      </form>
      <div class="note-form__actions">
        <PixButton @variant="secondary" @triggerAction={{@close}}>
          Retour
        </PixButton>
        {{#if @edition}}
          <PixButton @variant="success" @triggerAction={{@save}}>
            Enregistrer
          </PixButton>
        {{else}}
          {{#if @mayEdit}}
            <PixButton @variant="success" @triggerAction={{@edit}}>
              Modifier
            </PixButton>
          {{/if}}
        {{/if}}
      </div>
    </div>
  </template>
}
