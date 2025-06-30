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
    <div class={{concat "field textArea" (if @edition "" " disabled") (if this.maximized " maximized" "")}} ...attributes>
      <div>
        <label class="bold" for={{@id}}>
          {{@title}}
        </label>
        {{#if @edition}}
          <button
            {{on "click" this.toggleMaximized}}
            class={{concat "ui compact icon right floated button" (if this.maximized " primary" " basic")}}
            type="button"
          >
            <i class={{concat (if this.maximized "compress " "expand ") "icon"}}></i>
          </button>
          {{#if @helpContent}}
            <div class="ui compact icon right floated button basic">
              <PixTooltip
                @id="info-tooltip"
                @position="left"
                @isInline ={{true}}
              >
                <:triggerElement>
                  <PixIcon aria-describedby="info-tooltip" @name="help"/>
                </:triggerElement>
                <:tooltip>
                  {{this.safeHelpContent}}
                </:tooltip>
              </PixTooltip>
            </div>
          {{/if}}
        {{/if}}
      </div>
      <Textarea id={{@id}} @value={{@value}} rows="4" readonly={{not @edition}} class="attached" {{on "change" this.change}}/>
    </div>

  </template>
}
