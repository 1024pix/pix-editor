import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class FieldToggleFieldComponent extends Component {
  <template>
    {{#if @edition}}
      <div class="toggle-field-v1">
        <button
          data-test-toggle-field-button
          class="toggle-field-v1__button"
          {{on "click" this.toggleFieldDisplay}}
          type="button"
        >
          <PixIcon @name={{this.buttonIcon}} @ariaHidden={{true}} />
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
    return this.shouldDisplayField ? 'minus' : 'add';
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
