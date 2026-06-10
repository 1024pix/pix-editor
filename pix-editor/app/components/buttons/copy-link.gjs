import { on } from '@ember/modifier';
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
    <button class="ui button item" {{on "click" this.copyLink}} type="button">
      <i class="linkify icon"></i>
      Copier le lien
    </button>
  </template>
}
