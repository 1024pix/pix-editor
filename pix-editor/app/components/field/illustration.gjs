import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import or from 'ember-truth-helpers/helpers/or';

export default class Illustration extends Component {
  <template>
    <div class="field field--files" ...attributes>
      {{#if (or @value @edition)}}
        <h3 class="field-title">{{@title}}</h3>
      {{/if}}
      {{#if @value}}
        {{#if @value.url}}
          <img src={{@value.url}} alt class="clickable" {{on "click" @display}} />
        {{else}}
          {{@value.file.name}}
          ({{@value.file.size}}
          octets)
        {{/if}}
        {{#if @edition}}
          <PixIconButton @ariaLabel="Supprimer l'image" @iconName="close" @triggerAction={{this.remove}} />
        {{/if}}
      {{/if}}
      {{#if @edition}}
        {{#let (fileQueue name="illustration" onFileAdded=this.add) as |queue|}}
          <label>
            Choisir une image...
            <input type="file" accept="image/*" {{queue.selectFile}} />
          </label>
        {{/let}}
      {{/if}}
    </div>
  </template>

  @action
  remove() {
    this.args.removeIllustration();
  }

  @action
  async add(file) {
    await this.args.removeIllustration();
    this.args.addIllustration(file);
  }
}
