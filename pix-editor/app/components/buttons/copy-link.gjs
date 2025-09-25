import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import CopyButton from "ember-cli-clipboard/components/copy-button";

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

  <template>
    <CopyButton
      class="ui button item"
      @text={{@link}}
      @onSuccess={{this.linkCopySuccess}}
      @onError={{this.linkCopyError}}
    >
      <i class="linkify icon"></i>
      Copier le lien
    </CopyButton>
  </template>
}
