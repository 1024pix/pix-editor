import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import { or } from 'ember-truth-helpers';

export default class Illustration extends Component {
  inputId = `add-illustration-input-${guidFor(this)}`;

  @action
  remove() {
    this.args.removeIllustration();
  }

  @action
  async add(file) {
    await this.args.removeIllustration();
    this.args.addIllustration(file);
  }

  <template>
    <div class="illustration-field">
      {{#if (or @value @edition)}}
        <h3 class="illustration-field--title">{{@title}}</h3>
      {{/if}}
      {{#if @value}}
        <div class="illustration-field--infos">
          {{#if @value.url}}
            <button
              aria-label="agrandir l'image"
              class="illustration-field--display-image"
              type="button"
              {{on "click" @display}}
            >
              <img src={{@value.url}} alt="" />
            </button>
          {{else}}
            <p class="illustration-field--name">{{@value.file.name}} ({{@value.file.size}} octets)</p>
          {{/if}}
          {{#if @edition}}
            <PixIconButton @ariaLabel="Supprimer l'image" @iconName="close" @triggerAction={{this.remove}} />
          {{/if}}
        </div>
      {{/if}}
      {{#if @edition}}
        {{#let (fileQueue name="illustration" onFileAdded=this.add) as |queue|}}
          <div class="illustration-field--input-image">
            <label for={{this.inputId}}>
              Choisir une image
            </label>
            <input id={{this.inputId}} type="file" accept="image/*" {{queue.selectFile}} />
          </div>
        {{/let}}
      {{/if}}
    </div>
  </template>
}
