import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import Tube from 'pixeditor/components/form/tube';
import SelectLocation from 'pixeditor/components/pop-in/select-location';
import scrollTop from 'pixeditor/modifiers/scroll-top';
<template>
  <div class="tube-header">
    <div class="ui menu">
      <div class="ui left menu">
        {{#if (and @controller.mayMove (not @controller.creation) (not @controller.edition))}}
          <button class="ui button icon item" {{on "click" @controller.selectCompetence}} type="button"><i
              class="icon random"
            ></i></button>
        {{/if}}
      </div>
      <div class="item header {{if @controller.creation 'creation'}}">
        {{#if @controller.creation}}
          Nouveau tube de la thématique "{{@controller.tube.theme.name}}"
        {{else}}
          {{@controller.tube.name}}
        {{/if}}
      </div>
      <div class="ui right menu">
        {{#if @controller.maximized}}
          <button class="ui button icon item" {{on "click" @controller.minimize}} type="button"><i
              class="window minimize icon"
            ></i></button>
        {{else}}
          <button class="ui button icon item" {{on "click" @controller.maximize}} type="button"><i
              class="window maximize outline icon"
            ></i></button>
        {{/if}}
        <button class="ui button icon item" {{on "click" @controller.close}} type="button"><i
            class="icon window close"
          ></i></button>
      </div>
    </div>
  </div>
  <div class="tube-details">
    <div class="tube-data" {{scrollTop @controller.edition}}>
      <Tube @tube={{@controller.tube}} @edition={{@controller.edition}} @creation={{@controller.creation}} />
    </div>
    <div class="ui vertical compact labeled icon menu tube-menu">
      {{#if @controller.edition}}
        <button
          class="ui button item important-action {{if @controller.disableSaveButton ' disabled'}}"
          {{on "click" @controller.save}}
          type="button"
        >
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
