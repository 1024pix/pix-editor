import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class PublishModuleButton extends Component {
  @service intl;
  @service loader;
  @service notifications;
  @service router;

  @action async publish() {
    try {
      const module = await this.args.draftModule.publish();
      this.notifications.sendSuccess(
        this.intl.t('modules.components.publish-module-button.success', { title: module.internalTitle }),
      );
      this.router.replaceWith('authenticated.modules.production-module', module.id);
    } catch {
      this.notifications.sendError(this.intl.t('modules.components.publish-module-button.error'));
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
    <PixButton @triggerAction={{this.publish}} @variant="success" aria-label={{this.ariaLabel}}>
      {{t "modules.components.publish-module-button.publish"}}
    </PixButton>
  </template>
}
