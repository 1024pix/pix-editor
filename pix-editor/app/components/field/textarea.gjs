import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
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
      {{#unless @hideActionBar}}
        <div class="field__textarea-actions">
          {{#if @edition}}
            <PixIconButton
              @iconName={{if this.maximized "minus" "openInFull"}}
              {{on "click" this.toggleMaximized}}
              class={{if this.maximized " field-textarea__button--active" ""}}
            />
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
      {{/unless}}
      <PixTextarea
        id={{@id}}
        @value={{@value}}
        rows="4"
        readonly={{not @edition}}
        class="attached"
        {{on "change" this.change}}
      >
        <:label>{{@title}}</:label>
      </PixTextarea>
    </div>
  </template>
}
