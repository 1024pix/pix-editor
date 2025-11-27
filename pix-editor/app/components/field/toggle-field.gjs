import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';

export default class FieldToggleFieldComponent extends Component {
<template>{{#if @edition}}
  <div class="ui text menu note-menu toggle-field-v1 ">
    <button data-test-toggle-field-button class="ui button item" {{on "click" this.toggleFieldDisplay}} type="button">
      <i class="{{this.buttonIcon}} icon"></i>
      {{this.buttonTitle}}
      {{#if @textToolTip}}
        <PixTooltip @position="bottom" @isLight={{false}} @isWide={{true}}>
          <:triggerElement>
            <PixIcon class="tooltip-icon" @name="help" @plainIcon={{true}} />
          </:triggerElement>
          <:tooltip>{{@textToolTip}} </:tooltip>
        </PixTooltip>
      {{/if}}
    </button>
  </div>
{{/if}}
{{#if this.shouldDisplayField}}
  {{yield}}
{{/if}}
</template>

@service confirm;

get shouldDisplayField() {
  return this.args.displayField || !!this.args.model.get(`${this.args.modelField}`);
}

get buttonIcon() {
  return this.shouldDisplayField ? 'minus' : 'plus';
}

get buttonTitle() {
  return this.shouldDisplayField ? this.args.hideTextButton : this.args.displayTextButton;
}

@action
async toggleFieldDisplay() {
  if (this.shouldDisplayField) {
    await this.confirm.ask('Suppression', `Êtes-vous sûr de vouloir supprimer ${this.args.confirmText} ?`);
    this.args.setDisplayField(false);
  } else {
    this.args.setDisplayField(true);
  }
}
}
