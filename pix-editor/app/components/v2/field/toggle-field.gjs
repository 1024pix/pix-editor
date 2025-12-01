import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class FieldToggleFieldComponent extends Component {
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

  <template>
    {{#if @edition}}
      <div class="toggle-field">
        <button type="button" class="toggle-field--button" {{on "click" this.toggleFieldDisplay}}>
          <i class="{{this.buttonIcon}} icon"></i>
          {{this.buttonTitle}}
        </button>
        {{#if @textToolTip}}
          <PixTooltip class="toggle-field--tooltip" @position="bottom" @isLight={{false}} @isWide={{true}}>
            <:triggerElement>
              <PixIcon @name="help" @plainIcon={{true}} />
            </:triggerElement>
            <:tooltip>{{@textToolTip}} </:tooltip>
          </PixTooltip>
        {{/if}}
      </div>
    {{/if}}
    {{#if this.shouldDisplayField}}
      {{yield}}
    {{/if}}
  </template>
}
