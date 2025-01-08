import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ChallengesProduction extends Component {
  @service router;
  @service multipanelManager;

  @action
  closePanel() {
    this.multipanelManager.reset();
    this.router.transitionTo('authenticated.v2.competence-overview');
  }

  @action
  expandPanel() {
    this.multipanelManager.expandTable();
  }

  <template>
    <header class="challenges-production-header">
      <p>
        {{@skill.name}}
        <PixTag @color="success">
          actif
        </PixTag>
        <span class="separator"></span>
        V{{@skill.version}}
      </p>
      <div class="challenges-production-header__action-buttons">
        <PixIconButton
          class="challenges-production-header__button-icon"
          @triggerAction={{this.expandPanel}}
          @ariaLabel="Agrandir la liste des épreuves"
          @iconName="openInFull"
        />
        <span class="separator"></span>
        <PixIconButton
          class="challenges-production-header__button-icon"
          @triggerAction={{this.closePanel}}
          @ariaLabel="Fermer la liste des épreuves"
          @iconName="close"
        />
      </div>
    </header>
  </template>
}
