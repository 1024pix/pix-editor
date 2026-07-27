import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import FormSelectLocation from '../form/select-location';

export default class PopinSelectLocation extends Component {
  @tracked disableActionButton = this.args.variant !== 'skill';

  get actionButtonTitle() {
    if (this.args.variant === 'skill') {
      return 'Dupliquer';
    }
    return 'Déplacer';
  }

  @action
  closeModal() {
    this.args.close();
  }

  @action
  setIsSubmittable(value) {
    this.disableActionButton = !value;
  }

  @action
  onSubmit(...args) {
    if (this.disableActionButton) return;
    this.args.onSubmit(...args);
    this.closeModal();
  }

  <template>
    <PixModal @title={{@title}} @onCloseButtonClick={{this.closeModal}} @showModal={{@showModal}}>
      <:content>
        {{#if @showModal}}
          <FormSelectLocation
            @variant={{@variant}}
            @theme={{@theme}}
            @tube={{@tube}}
            @skill={{@skill}}
            @setIsSubmittable={{this.setIsSubmittable}}
            @onSubmit={{this.onSubmit}}
          />
        {{/if}}
      </:content>
      <:footer>
        <PixButton @iconBefore="close" @variant="secondary" @triggerAction={{this.closeModal}}>
          {{t "common.cancel"}}
        </PixButton>
        <PixButton
          @isDisabled={{this.disableActionButton}}
          @type="submit"
          form="form-select-location"
          @iconBefore="check"
        >
          {{this.actionButtonTitle}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
