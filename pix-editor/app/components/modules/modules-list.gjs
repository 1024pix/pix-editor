import Component from '@glimmer/component';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixButton from '@1024pix/pix-ui/components/pix-button';

function getVisibilityColor(visibility) {
  return { public: 'green', private: 'grey' }[visibility];
}

export default class Product extends Component {
  @service router;

  @action
  goToDetailPage(moduleId) {
    this.router.transitionTo('authenticated.modules.production-module', moduleId);
  }

  <template>
    <PixTable @variant="modulix" @data={{@modules}} @caption="Liste des modules">
      <:columns as |module context|>
        {{#if @showStatus}}
          <PixTableColumn @context={{context}}>
            <:header>
              Statut
            </:header>
            <:cell>
              <div class="modules-list__status">
                <PixTag @color={{getVisibilityColor module.visibility}}>
                  {{module.visibilityForDisplay}}
                </PixTag>
                {{#if module.isBeta}}
                  <PixTag @color="yellow">Beta</PixTag>
                {{/if}}
              </div>
            </:cell>
          </PixTableColumn>
        {{/if}}
        <PixTableColumn @context={{context}}>
          <:header>
            Titre interne
          </:header>
          <:cell>
            {{module.internalTitle}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Niveau
          </:header>
          <:cell>
            {{module.levelForDisplay}}
          </:cell>
        </PixTableColumn>
        {{#if module.mayShowProductionDetails}}
          <PixTableColumn @context={{context}}>
            <:header>
              Actions
            </:header>
            <:cell>
              <div class="modules-list__actions">
                <PixButton @triggerAction={{fn this.goToDetailPage module.id}}>
                  Voir le détail
                </PixButton>
              </div>
            </:cell>
          </PixTableColumn>
        {{/if}}
      </:columns>
    </PixTable>
  </template>
}
