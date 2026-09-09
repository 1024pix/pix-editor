import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class CreateModuleButton extends Component {
  @service access;

  get isDisplayed() {
    return !this.args.module?.hasDraft && this.access.mayCreateOrEditModule();
  }

  get query() {
    const { module } = this.args;
    if (!module) return {};
    return {
      moduleId: module.id,
    };
  }

  <template>
    {{#if this.isDisplayed}}
      <PixButtonLink
        @route="authenticated.modules.new"
        @query={{this.query}}
        class="pix-button-link-with-icon white-font"
        @iconBefore="add"
      >
        {{#if @module}}
          {{t "modules.components.create-module-button.create-draft"}}
        {{else}}
          {{t "modules.components.create-module-button.create-module"}}
        {{/if}}
      </PixButtonLink>
    {{/if}}
  </template>
}
