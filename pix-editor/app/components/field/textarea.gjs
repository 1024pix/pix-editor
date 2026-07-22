import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { Textarea } from '@ember/component';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { not } from 'ember-truth-helpers';

export default class FieldTextarea extends Component {
  @tracked maximized = false;

  get safeHelpContent() {
    return htmlSafe(this.args.helpContent);
  }

  @action
  toggleMaximized() {
    this.maximized = !this.maximized;
  }

  @action
  change(evt) {
    this.args.change?.(evt.target.value);
  }

  <template>
    <div
      class={{concat "field textArea" (if @edition "" " disabled") (if this.maximized " maximized" "")}}
      ...attributes
    >
      <div>
        <label class="bold" for={{@id}}>
          {{@title}}
        </label>
        {{#if @edition}}
          <button
            {{on "click" this.toggleMaximized}}
            class={{concat "field-textarea__button" (if this.maximized " field-textarea__button--active" "")}}
            type="button"
          >
            <PixIcon @name={{if this.maximized "minus" "openInFull"}} @ariaHidden={{true}} />
          </button>
          {{#if @helpContent}}
            <div class="field-textarea__help">
              <PixTooltip @id="info-tooltip" @position="left" @isInline={{true}}>
                <:triggerElement>
                  <PixIcon aria-describedby="info-tooltip" @name="help" />
                </:triggerElement>
                <:tooltip>
                  {{this.safeHelpContent}}
                </:tooltip>
              </PixTooltip>
            </div>
          {{/if}}
        {{/if}}
      </div>
      <Textarea
        id={{@id}}
        @value={{@value}}
        rows="4"
        readonly={{not @edition}}
        class="attached"
        {{on "change" this.change}}
      />
    </div>
  </template>
}
