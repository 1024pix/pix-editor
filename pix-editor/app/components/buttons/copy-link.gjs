import { action } from '@ember/object';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';

export default class CopyLink extends Component {
  @service notify;

  @action
  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.args.link);
      this.notify.message('Lien copié');
    } catch {
      this.notify.error('Erreur lors de la copie');
    }
  }

  <template>
    <button class="ui button item" {{on "click" this.copyLink}} type="button">
      <i class="linkify icon"></i>
      Copier le lien
    </button>
  </template>
}
