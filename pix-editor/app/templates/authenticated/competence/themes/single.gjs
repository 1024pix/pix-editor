import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import Theme from 'pixeditor/components/form/theme';
import scrollTop from 'pixeditor/modifiers/scroll-top';
<template>
  <div class="theme-view__header">
    <div class="theme-view__menu-bar">
      <div class="theme-view__title {{if @controller.creation 'theme-view__title--creation'}}">
        {{#if @controller.creation}}
          Nouveau theme
        {{else}}
          {{@controller.theme.name}}
        {{/if}}
      </div>
      <div class="theme-view__menu-right">
        <button
          type="button"
          class="theme-view__icon-action"
          aria-label="Fermer la fenêtre"
          {{on "click" @controller.close}}
        >
          <PixIcon @name="close" @ariaHidden={{true}} />
        </button>
      </div>
    </div>
  </div>
  <div class="theme-view__details">
    <div class="theme-view__data" {{scrollTop @controller.edition}}>
      <Theme @theme={{@controller.theme}} @edition={{@controller.edition}} />
    </div>
    <div class="theme-view__actions-menu">
      {{#if @controller.edition}}
        <PixButton
          class="theme-view__action theme-view__action--important"
          @iconBefore="save"
          @triggerAction={{@controller.save}}
        >
          Enregistrer
        </PixButton>
        <PixButton class="theme-view__action" @iconBefore="block" @triggerAction={{@controller.cancelEdit}}>
          Annuler
        </PixButton>
      {{else}}
        {{#if @controller.mayEdit}}
          <PixButton class="theme-view__action" @iconBefore="edit" @triggerAction={{@controller.edit}}>
            Modifier
          </PixButton>
        {{/if}}
      {{/if}}
    </div>
  </div>
</template>
