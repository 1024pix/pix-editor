import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat } from '@ember/helper';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import MarkdownToHtml from 'ember-cli-showdown/components/markdown-to-html';
import MarkdownEditor from 'pixeditor/components/markdown-editor/markdown-editor';

export default class Mde extends Component {
  <template>
    <div class={{concat "field textArea mde"}} ...attributes>
      <label for={{@id}}>
        {{@title}}
        <span>
          {{#if @edition}}
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
        </span>
      </label>
      {{#if @edition}}
        <MarkdownEditor id={{@id}} @value={{@value}} @onChange={{@setValue}} />
      {{else}}
        <div data-test-markdow-to-html class="mde-preview">
          <MarkdownToHtml @strikethrough={{true}} @tables={{true}} @markdown={{@value}} @maximized={{this.maximized}} />
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
