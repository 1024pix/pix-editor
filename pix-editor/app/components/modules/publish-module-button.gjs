import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class PublishModuleButton extends Component {
  @service loader;
  @service notifications;
  @service router;

  @action async publish() {
    try {
      const module = await this.args.draftModule.publish();
      this.notifications.sendSuccess(`Le module "${module.internalTitle}" a été publié.`);
      this.router.replaceWith('authenticated.modules.production-module', module.id);
    } catch {
      this.notifications.sendError('Erreur lors de la publication du module.');
    } finally {
      this.loader.stop();
    }
  }

  get ariaLabel() {
    return `Publier le module "${this.args.draftModule.internalTitle}"`;
  }

  <template>
    <PixButton @triggerAction={{this.publish}} @variant="success" aria-label={{this.ariaLabel}}>
      Publier
    </PixButton>
  </template>
}
