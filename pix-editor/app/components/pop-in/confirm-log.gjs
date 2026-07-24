import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { Textarea } from '@ember/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class PopInConfirmLog extends Component {
  <template>
    <PixModal @title={{@title}} @onCloseButtonClick={{@onDeny}} @showModal={{@showModal}}>
      <:content>
        <p>
          {{@content}}
        </p>
        <form class="form">
          <PixCheckbox
            @class="checkbox-layout"
            {{on "click" this.toggleDisplayTextarea}}
            @checked={{this.displayTextarea}}
            data-test-confirm-log-check
          >
            <:label>Je veux ajouter une note de changelog</:label>
          </PixCheckbox>
          {{#if this.displayTextarea}}
            <div class="changelog-layout">
              <label for={{this.inputId}}>
                {{@label}}
              </label>
              <Textarea id={{this.inputId}} @value={{this.defaultValue}} rows="4" class="changelog-textarea" />
            </div>
          {{/if}}
        </form>
      </:content>
      <:footer>
        <PixButton
          data-test-confirm-log-cancel
          @backgroundColor="transparent-light"
          @isBorderVisible={{true}}
          @triggerAction={{@onDeny}}
        >
          {{t "common.cancel"}}
        </PixButton>
        <PixButton data-test-confirm-log-approve @triggerAction={{fn @onApprove this.changeLogValue}}>{{t
            "common.validate"
          }}</PixButton>
      </:footer>
    </PixModal>
  </template>

  @tracked displayTextarea = false;
  defaultValue = this.args.defaultValue;
  inputId = this.args.inputId;

  @action
  toggleDisplayTextarea() {
    this.displayTextarea = !this.displayTextarea;
  }

  get changeLogValue() {
    if (this.displayTextarea) {
      return this.defaultValue;
    }
    return null;
  }
}
