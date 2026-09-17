import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import Component from '@glimmer/component';

export default class PopInConfirm extends Component {
  get title() {
    return this.args.title || 'no_title';
  }

  <template>
    <PixModal
      @title={{this.title}}
      @onCloseButtonClick={{@onDeny}}
      @showModal={{@showModal}}
      @variant="orga"
      ...attributes
    >
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
}
