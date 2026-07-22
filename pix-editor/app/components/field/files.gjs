import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { Input } from '@ember/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import or from 'ember-truth-helpers/helpers/or';

export default class Files extends Component {
  <template>
    <div class="field" ...attributes>
      {{#if (or @value.length @edition)}}
        <h3 class="field-title">{{@title}}</h3>
      {{/if}}
      {{#if @value.length}}
        {{#each @value as |file|}}
          <a href={{file.url}} download={{file.filename}} target="_blank" referrerpolicy="strict-origin">
            <PixIcon @name="download" @ariaHidden={{true}} />
            {{file.filename}}
          </a>
          {{#if @edition}}
            <button {{on "click" (fn this.remove file)}} class="file-remove" type="button" title="Supprimer le fichier">
              <PixIcon @name="close" @ariaHidden={{true}} />
            </button>
          {{/if}}
        {{/each}}
      {{/if}}
      {{#if @edition}}
        {{#let (fileQueue name="files" onFileAdded=this.add) as |queue|}}
          <label>
            Ajouter un fichier...
            <input type="file" {{queue.selectFile}} />
          </label>
        {{/let}}
        {{#if @value.length}}
          <div class="input">
            <label class="label-input" for="name">Nom :</label>
            <Input id="name" @value={{@baseName}} />
          </div>
        {{/if}}
      {{/if}}
    </div>
  </template>

  @service filePath;

  @action
  remove(file) {
    this.args.removeAttachment(file);
  }

  @action
  add(file) {
    this.args.addAttachment(file);
  }
}
