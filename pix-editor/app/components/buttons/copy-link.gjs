import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class CopyLink extends Component {
  @service notifications;

  @action
  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.args.link);
      this.notifications.sendSuccess('Lien copié');
    } catch {
      this.notifications.sendError('Erreur lors de la copie');
    }
  }

  <template>
    <PixButton @variant="secondary" @size="small" @iconBefore="link" @triggerAction={{this.copyLink}} ...attributes>
      Copier le lien
    </PixButton>
  </template>
}
