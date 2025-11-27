import { action } from '@ember/object';
import Component from '@glimmer/component';
import or from 'ember-truth-helpers/helpers/or';
import { on } from '@ember/modifier';
import fileQueue from 'ember-file-upload/helpers/file-queue';

export default class Illustration extends Component {
<template><div class="field" ...attributes>
  {{#if (or @value @edition)}}
    <h3 class="field-title">{{@title}}</h3>
  {{/if}}
  {{#if @value}}
    {{#if @value.url}}
      <img src={{@value.url}} alt class="clickable" {{on "click" @display}} role="presentation">
    {{else}}
      {{@value.file.name}} ({{@value.file.size}} octets)
    {{/if}}
    {{#if @edition}}
      <button {{on "click" this.remove}} class="ui button file-remove" type="button"><i class="remove icon" data-test-delete-illustration-button></i></button>
    {{/if}}
  {{/if}}
  {{#if @edition}}
    {{#let (fileQueue name="illustration" onFileAdded=this.add) as |queue|}}
      <label>
        Choisir une image...
        <input type="file" accept="image/*" {{queue.selectFile}}>
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
