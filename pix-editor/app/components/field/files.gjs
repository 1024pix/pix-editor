import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import or from 'ember-truth-helpers/helpers/or';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import { Input } from '@ember/component';

export default class Files extends Component {
  <template>
    <div class="field" ...attributes>
      {{#if (or @value.length @edition)}}
        <h3 class="field-title">{{@title}}</h3>
      {{/if}}
      {{#if @value.length}}
        {{#each @value as |file|}}
          <a href={{file.url}} download={{file.filename}} target="_blank" referrerpolicy="strict-origin"><i
              class="file icon"
            ></i>
            {{file.filename}}</a>
          {{#if @edition}}
            <button
              {{on "click" (fn this.remove file)}}
              class="ui button file-remove"
              data-test-delete-attachment-button
              type="button"
            ><i class="remove icon"></i></button>
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
          <div class="ui input">
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
