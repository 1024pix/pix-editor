import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { Textarea } from '@ember/component';
import PixButton from '@1024pix/pix-ui/components/pix-button';

export default class PopinChangelog extends Component {
  <template>
    <PixModal @title="Message pour le changelog" @onCloseButtonClick={{this.onDeny}} @showModal={{@showModal}}>
      <:content>
        <div class="content">
          <div class="description">
            <form class="ui form">
              <div class="field">
                <label>Texte</label>
                <div class="ui input" for="textarea_changelog">
                  <Textarea id="textarea_changelog" @value={{this.value}} rows="4" />
                </div>
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

  @service notify;

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
  approve() {
    this.args.onApprove(this.value);
    this.value = null;
  }

  @action
  onDeny() {
    this.notify.message('Le message de changelog est obligatoire');
  }
}
