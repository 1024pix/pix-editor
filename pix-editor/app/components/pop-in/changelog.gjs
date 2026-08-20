import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Textarea from 'pixeditor/components/field/textarea';

export default class PopinChangelog extends Component {
  <template>
    <PixModal @title="Message pour le changelog" @onCloseButtonClick={{this.onDeny}} @showModal={{@showModal}}>
      <:content>
        <div class="content">
          <div class="description">
            <form class="form">
              <div class="field">
                <Textarea
                  @title="Texte"
                  @value={{this.value}}
                  rows="4"
                  @change={{this.change}}
                  @edition={{true}}
                  @hideActionBar={{true}}
                />
              </div>
            </form>
          </div>
        </div>
      </:content>
      <:footer>
        <PixButton data-test-save-changelog-button @triggerAction={{this.approve}}>Enregistrer</PixButton>
      </:footer>
    </PixModal>
  </template>

  @service notifications;

  @tracked _value = null;

  get value() {
    if (this._value) {
      return this._value;
    }
    return this.args.defaultValue;
  }

  set value(value) {
    this._value = value;
    return value;
  }

  @action
  change(value) {
    this.value = value;
  }

  @action
  approve() {
    this.args.onApprove(this.value);
    this.value = null;
  }

  @action
  onDeny() {
    this.notifications.sendError('Le message de changelog est obligatoire');
  }
}
