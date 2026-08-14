import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class PublishModuleButton extends Component {
  @service intl;
  @service loader;
  @service notifications;
  @service router;

  @tracked showModal = false;

  @action openModal() {
    this.showModal = true;
  }

  @action closeModal() {
    this.showModal = false;
  }

  @action async publish() {
    try {
      const module = await this.args.draftModule.publish();
      this.closeModal();
      this.notifications.sendSuccess(
        this.intl.t('modules.components.publish-module-button.success', { title: module.internalTitle }),
      );
      this.router.replaceWith('authenticated.modules.production-module', module.id);
    } catch (error) {
      this.closeModal();
      const isValidationError = error.errors?.some((error) => error.code === 'DRAFT_MODULE_VALIDATION_ERROR');
      if (isValidationError) {
        this.notifications.sendError(this.intl.t('modules.components.publish-module-button.validation-error'));
      } else {
        this.notifications.sendError(this.intl.t('modules.components.publish-module-button.error'));
      }
    } finally {
      this.loader.stop();
    }
  }

  get ariaLabel() {
    return this.intl.t('modules.components.publish-module-button.aria-label', {
      title: this.args.draftModule.internalTitle,
    });
  }

  <template>
    <PixButton @triggerAction={{this.openModal}} @variant="success" aria-label={{this.ariaLabel}}>
      {{t "modules.components.publish-module-button.publish"}}
    </PixButton>
    <PixModal
      @showModal={{this.showModal}}
      @title={{t "modules.components.publish-module-button.confirmation-dialog.title"}}
      @onCloseButtonClick={{this.closeModal}}
    >
      <:content>
        <div class="publish-module-button-modal__content">
          <p>{{t
              "modules.components.publish-module-button.confirmation-dialog.question"
              title=@draftModule.internalTitle
            }}</p>
          <p>{{t "modules.components.publish-module-button.confirmation-dialog.message"}}</p>
        </div>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @isBorderVisible={{true}} @triggerAction={{this.closeModal}}>
          {{t "common.cancel"}}
        </PixButton>
        <PixButton @variant="success" @triggerAction={{this.publish}}>{{t
            "modules.components.publish-module-button.confirmation-dialog.confirm"
          }}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
