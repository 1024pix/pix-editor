import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CopyLink extends Component {
  @service notify;

  @action
  linkCopySuccess() {
    this.notify.message('Lien copié');
  }

  @action
  linkCopyError() {
    this.notify.error('Erreur lors de la copie');
  }
}
