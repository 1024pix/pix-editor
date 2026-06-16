import { on } from '@ember/modifier';
import Theme from 'pixeditor/components/form/theme';
import scrollTop from 'pixeditor/modifiers/scroll-top';
<template>
  <div class="tube-header">
    <div class="ui menu">
      <div class="item header {{if @controller.creation 'creation'}}">
        {{#if @controller.creation}}
          Nouveau theme
        {{else}}
          {{@controller.theme.name}}
        {{/if}}
      </div>
      <div class="ui right menu">
        <button class="ui button icon item" type="button" title="Fermer la fenêtre" {{on "click" @controller.close}}>
          <i class="icon window close"></i>
        </button>
      </div>
    </div>
  </div>
  <div class="tube-details">
    <div class="tube-data" {{scrollTop @controller.edition}}>
      <Theme @theme={{@controller.theme}} @edition={{@controller.edition}} />
    </div>
    <div class="ui vertical compact labeled icon menu tube-menu">
      {{#if @controller.edition}}
        <button class="ui button item important-action" type="button" {{on "click" @controller.save}}>
          <i class="save icon"></i>
          Enregistrer
        </button>
        <button class="ui button item" type="button" {{on "click" @controller.cancelEdit}}>
          <i class="ban icon"></i>
          Annuler
        </button>
      {{else}}
        {{#if @controller.mayEdit}}
          <button class="ui button item" type="button" {{on "click" @controller.edit}}>
            <i class="edit icon"></i>
            Modifier
          </button>
        {{/if}}
      {{/if}}
    </div>
  </div>
</template>
