import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

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
        <PixTableColumn @context={{context}} class="modules-list__actions">
          <:header>
            Actions
          </:header>
          <:cell>
            <PixButtonLink
              @route={{if
                module.isDraft
                "authenticated.modules.draft-module"
                "authenticated.modules.production-module"
              }}
              @model={{module.id}}
            >
              Voir le détail
            </PixButtonLink>
            {{#if module.isEditionDraft}}
              <PixButtonLink
                @route="authenticated.modules.production-module"
                @model={{module.moduleId}}
                @variant="secondary"
              >
                Voir le détail du module en prod
              </PixButtonLink>
            {{/if}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </template>
}
