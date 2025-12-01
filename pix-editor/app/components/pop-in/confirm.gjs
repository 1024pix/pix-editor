import Component from '@glimmer/component';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixButton from '@1024pix/pix-ui/components/pix-button';

export default class PopInConfirm extends Component {
  <template>
    <PixModal @title={{this.title}} @onCloseButtonClick={{@onDeny}} @showModal={{@showModal}} ...attributes>
      <:content>
        {{@content}}
      </:content>
      <:footer>
        <PixButton @backgroundColor="transparent-light" @isBorderVisible={{true}} @triggerAction={{@onDeny}}>
          Annuler
        </PixButton>
        <PixButton @triggerAction={{@onApprove}} data-testid="popin-confirm-button">Oui</PixButton>
      </:footer>
    </PixModal>
  </template>

  get title() {
    return this.args.title || 'no_title';
  }
}
