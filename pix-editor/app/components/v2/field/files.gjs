import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { concat, fn } from '@ember/helper';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import fileQueue from 'ember-file-upload/helpers/file-queue';
import { or } from 'ember-truth-helpers';
import { on } from '@ember/modifier';

export default class Files extends Component {
  inputUploadId = `add-file-input-${guidFor(this)}`;
  inputNameId = `replace-name-input-${guidFor(this)}`;

  @service filePath;

  @action
  remove(file) {
    this.args.removeAttachment(file);
  }

  @action
  add(file) {
    this.args.addAttachment(file);
  }

  <template>
    <div class="files-field" ...attributes>
      {{#if (or @value.length @edition)}}
        <h3 class="files-field--title">{{@title}}</h3>
      {{/if}}
      {{#if @value.length}}
        {{#each @value as |file|}}
        <div class="files-field--display">
          <a href={{file.url}}
            download={{file.filename}}
            target="_blank"
            rel="noopener noreferrer"
            class="files-field--download"
          >
            <PixIcon @name="infoUser" @plainIcon={{true}} @ariaHidden={{true}} />
            {{file.filename}}
          </a>
          {{#if @edition}}
            <PixIconButton
              @ariaLabel="{{concat 'Supprimer la pièce jointe ' file.filename}}"
              @iconName="close"
              class="files-field--remove"
              @triggerAction={{(fn this.remove file)}}
            />
          {{/if}}
        </div>
        {{/each}}
      {{/if}}
      {{#if @edition}}
        {{#let (fileQueue name="files" onFileAdded=this.add) as |queue|}}
        <div class="files-field--input-file">
          <label for={{this.inputUploadId}}>
            Ajouter un fichier...
          </label>
          <input id={{this.inputUploadId}} type="file" {{queue.selectFile}} />
        </div>
        {{/let}}
        {{#if @value.length}}
          <div class="files-field--input-name">
            <PixInput {{on "change" @updateBasename}} @id={{this.inputNameId}} @value={{@attachmentBaseName}} @inlineLabel={{true}}>
              <:label>Nom :</:label>
            </PixInput>
          </div>
        {{/if}}
      {{/if}}
    </div>
  </template>
}
