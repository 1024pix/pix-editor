import { on } from '@ember/modifier';
import scrollTop from 'pixeditor/modifiers/scroll-top';
import Theme from 'pixeditor/components/form/theme';
<template><div class="tube-header">
  <div class="ui menu">
    <div class="item header {{if @controller.creation "creation"}}">
      {{#if @controller.creation}}
        Nouveau theme
      {{else}}
        {{@controller.theme.name}}
      {{/if}}
    </div>
    <div class="ui right menu">
      <button class="ui button icon item" {{on "click" @controller.close}} type="button"><i class="icon window close"></i></button>
    </div>
  </div>
</div>
<div class="tube-details">
  <div class="tube-data" {{scrollTop @controller.edition}}>
    <Theme @theme={{@controller.theme}} @edition={{@controller.edition}} />
  </div>
  <div class="ui vertical compact labeled icon menu tube-menu">
    {{#if @controller.edition}}
      <button class="ui button item important-action" {{on "click" @controller.save}} type="button">
        <i class="save icon"></i>
        Enregistrer
      </button>
      <button class="ui button item" {{on "click" @controller.cancelEdit}} type="button">
        <i class="ban icon"></i>
        Annuler
      </button>
    {{else}}
      {{#if @controller.mayEdit}}
        <button class="ui button item" {{on "click" @controller.edit}} type="button">
          <i class="edit icon"></i>
          Modifier
        </button>
      {{/if}}
    {{/if}}
  </div>
</div>
</template>
