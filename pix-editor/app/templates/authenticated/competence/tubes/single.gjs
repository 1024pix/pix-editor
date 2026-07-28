import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { concat } from '@ember/helper';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import Tube from 'pixeditor/components/form/tube';
import SelectLocation from 'pixeditor/components/pop-in/select-location';
import scrollTop from 'pixeditor/modifiers/scroll-top';
<template>
  <div class="tube-view__header">
    <div class="tube-view__menu-bar">
      <div class="tube-view__menu-left">
        {{#if (and @controller.mayMove (not @controller.creation) (not @controller.edition))}}
          <PixIconButton
            class="tube-view__icon-action"
            type="button"
            @iconName="conversionPath"
            @ariaLabel="Déplacer le sujet"
            @triggerAction={{@controller.selectCompetence}}
          />
        {{/if}}
      </div>
      <div class="tube-view__title {{if @controller.creation 'tube-view__title--creation'}}">
        {{#if @controller.creation}}
          Nouveau tube de la thématique "{{@controller.tube.theme.name}}"
        {{else}}
          {{@controller.tube.name}}
        {{/if}}
      </div>
      <div class="tube-view__menu-right">
        {{#if @controller.maximized}}
          <PixIconButton
            class="tube-view__icon-action"
            type="button"
            @iconName="minus"
            @ariaLabel="Minimiser la fenêtre"
            @triggerAction={{@controller.minimize}}
          />
        {{else}}
          <PixIconButton
            class="tube-view__icon-action"
            type="button"
            @iconName="openInFull"
            @ariaLabel="Maximiser la fenêtre"
            @triggerAction={{@controller.maximize}}
          />
        {{/if}}
        <PixIconButton
          class="tube-view__icon-action"
          type="button"
          @iconName="close"
          @ariaLabel="Fermer la fenêtre"
          @triggerAction={{@controller.close}}
        />
      </div>
    </div>
  </div>
  <div class="tube-view__details">
    <div class="tube-view__data" {{scrollTop @controller.edition}}>
      <Tube
        @tube={{@controller.tube}}
        @edition={{@controller.edition}}
        @creation={{@controller.creation}}
        @setPracticalDescriptionFr={{@controller.setPracticalDescriptionFr}}
        @setPracticalDescriptionEn={{@controller.setPracticalDescriptionEn}}
      />
    </div>
    <div class="tube-view__actions-menu">
      {{#if @controller.edition}}
        <PixButton
          class="tube-view__action tube-view__action--important"
          @variant="secondary"
          @iconBefore="check"
          @isDisabled={{@controller.disableSaveButton}}
          @triggerAction={{@controller.save}}
        >
          Enregistrer
        </PixButton>
        <PixButton
          class="tube-view__action"
          @variant="secondary"
          @iconBefore="cancel"
          @triggerAction={{@controller.cancelEdit}}
        >
          Annuler
        </PixButton>
      {{else}}
        {{#if @controller.mayEdit}}
          <PixButton
            class="tube-view__action"
            @variant="secondary"
            @iconBefore="edit"
            @triggerAction={{@controller.edit}}
          >
            Modifier
          </PixButton>
        {{/if}}
      {{/if}}
    </div>
  </div>
  <SelectLocation
    @variant="tube"
    @class="tube-select-competence"
    @onSubmit={{@controller.setCompetence}}
    @title={{concat "Déplacer le tube " @controller.tube.name " dans une autre thématique"}}
    @theme={{@controller.tube.theme}}
    @close={{@controller.closeSelectCompetence}}
    @showModal={{@controller.displaySelectLocation}}
  />
</template>
