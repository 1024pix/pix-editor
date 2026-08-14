import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ModuleValidationTag from 'pixeditor/components/modules/validation-tag';

import PlayModuleButton from './play-module-button';

function getVisibilityColor(visibility) {
  return { public: 'green', private: 'grey' }[visibility];
}

function hasValidationStatus(module) {
  return module.hasBeenValidated !== undefined;
}

export default class ModulesList extends Component {
  @service router;

  @action
  goToDetailPage(moduleId) {
    this.router.transitionTo('authenticated.modules.production-module', moduleId);
  }

  <template>
    <PixTable @variant="modulix" @data={{@modules}} @caption={{t "modules.components.modules-list.caption"}}>
      <:columns as |module context|>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "modules.components.modules-list.status"}}
          </:header>
          <:cell>
            {{#if (hasValidationStatus module)}}
              <ModuleValidationTag @hasBeenValidated={{module.hasBeenValidated}} />
            {{else}}
              <div class="modules-list__status">
                <PixTag @color={{getVisibilityColor module.visibility}}>
                  {{module.visibilityForDisplay}}
                </PixTag>
                {{#if module.isBeta}}
                  <PixTag @color="yellow">Beta</PixTag>
                {{/if}}
              </div>
            {{/if}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "modules.components.modules-list.internal-title"}}
          </:header>
          <:cell>
            {{module.internalTitle}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "modules.components.modules-list.level"}}
          </:header>
          <:cell>
            {{module.levelForDisplay}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="modules-list__actions">
          <:header>
            <span class="sr-only">{{t "modules.components.modules-list.actions"}}</span>
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
              {{t "modules.components.modules-list.detail"}}
            </PixButtonLink>
            <PlayModuleButton @module={{module}} @isPreview={{module.isDraft}} />
            {{#if module.isEditionDraft}}
              <PixButtonLink
                @route="authenticated.modules.production-module"
                @model={{module.moduleId}}
                @variant="secondary"
              >
                {{t "modules.components.modules-list.production-detail"}}
              </PixButtonLink>
            {{/if}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </template>
}
