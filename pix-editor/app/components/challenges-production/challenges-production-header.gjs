import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ChallengesProduction extends Component {
  @service router;
  @service multipanelManager;

  @action
  closePanel(competence_id, overview) {
    this.multipanelManager.onTableClosed();
    this.router.transitionTo('authenticated.v2.competence-overview', competence_id, overview);
  }

  @action
  expandPanel() {
    this.multipanelManager.expandTable();
  }

  <template>
    <header class="challenges-production-header">
      <p>
        {{@skill.name}}
        <PixTag @color="green">
          actif
        </PixTag>
        <span class="challenges-production-header__separator"></span>
        V{{@skill.version}}
      </p>
      <div class="challenges-production-header__action-buttons">
        {{#if @canExpand}}
          <PixIconButton
            class="challenges-production-header__button-icon"
            @triggerAction={{this.expandPanel}}
            @ariaLabel="Agrandir la liste des épreuves"
            @iconName="openInFull"
          />
          <span class="challenges-production-header__separator"></span>
        {{/if}}
        <PixIconButton
          class="challenges-production-header__button-icon"
          @triggerAction={{fn this.closePanel @competenceId @overview}}
          @ariaLabel="Fermer la liste des épreuves"
          @iconName="close"
        />
      </div>
    </header>
  </template>
}
