import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { concat } from '@ember/helper';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import MarkdownToHtml from 'ember-cli-showdown/components/markdown-to-html';
import MarkdownEditor from 'pixeditor/components/markdown-editor/markdown-editor';

export default class Mde extends Component {
  <template>
    <div class={{concat "field textArea mde" (if this.maximized " maximized" "")}} ...attributes>
      <label>
        {{@title}}
        <span>
          {{#if @edition}}
            {{#if @helpContent}}
              <div class="ui compact icon right floated button basic">
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
            <button
              {{on "click" this.toggleMaximized}}
              class={{concat "ui compact icon right floated button" (if this.maximized " primary" " basic")}}
              type="button"
            ><i class={{concat (if this.maximized "compress " "expand ") "icon"}}></i></button>
          {{/if}}
        </span>
      </label>
      {{#if @edition}}
        <MarkdownEditor @value={{@value}} @onChange={{@setValue}} />
      {{else}}
        <div data-test-markdow-to-html class="mde-preview">
          <MarkdownToHtml @markdown={{@value}} />
        </div>
      {{/if}}
    </div>
  </template>

  @tracked maximized = false;

  get safeHelpContent() {
    return htmlSafe(this.args.helpContent);
  }

  @action
  toggleMaximized() {
    this.maximized = !this.maximized;
  }
}
