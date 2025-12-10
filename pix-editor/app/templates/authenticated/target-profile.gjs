import { Input } from '@ember/component';
import { on } from '@ember/modifier';
import PdfExport from 'pix-editor/components/target-profile/pdf-export';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import AreaProfile from 'pix-editor/components/target-profile/area-profile';
import TubeLevel from 'pix-editor/components/pop-in/tube-level';
import SingleEntry from 'pix-editor/components/pop-in/single-entry';
import ThresholdCalculation from 'pix-editor/components/pop-in/threshold-calculation';
<template>
  <div class="main-left">
    <div class="main-title">
      <h1 class="ui header">{{if
          @controller.isThematicResultMode
          "Générateur de résultat thématique"
          "Générateur de profil cible"
        }}
        <div class="target-profile-filter {{if @controller.isThematicResultMode 'active'}}">
          Résultat thématique
          <div class="ui toggle checkbox">
            <Input
              id="thematicResult"
              @type="checkbox"
              @checked={{@controller.isThematicResultMode}}
              {{on "change" @controller.toggleThematicResult}}
              class="toggle"
            />
            <label class="checkbox-label" for="thematicResult"></label>
          </div>
        </div>
        {{#unless @controller.isThematicResultMode}}
          <div class="target-profile-filter {{if @controller.showTubeDetails 'active'}}">
            Détails des sujets
            <div class="ui toggle checkbox">
              <Input id="tubeDetails" @type="checkbox" @checked={{@controller.showTubeDetails}} class="toggle" />
              <label class="checkbox-label" for="tubeDetails"></label>
            </div>
          </div>
          <div class="target-profile-filter {{if @controller.filter 'active'}}">
            Filtrer les sujets sélectionnés
            <div class="ui toggle checkbox">
              <Input id="filter" @type="checkbox" @checked={{@controller.filter}} class="toggle" />
              <label class="checkbox-label" for="filter"></label>
            </div>
          </div>
        {{/unless}}
      </h1>
    </div>
    <div class="ui top attached borderless labelled icon menu">
      {{#unless @controller.isThematicResultMode}}
        <button class="ui button first left" {{on "click" @controller.load}} type="button">
          <i class="folder open icon"></i>Ouvrir
        </button>
        <button class="ui button left" {{on "click" @controller.getSaveTitle}} type="button">
          <i class="save icon"></i>Enregistrer
        </button>
      {{/unless}}
      <div class="right menu">
        {{#unless @controller.isThematicResultMode}}
          <button class="ui button" {{on "click" @controller.showThresholdCalculation}} type="button">
            <i class="calculator icon"></i>Paliers indicatifs
          </button>
        {{/unless}}
        <button class="ui button" {{on "click" @controller.getGenerateTitleOrThematicResultTitle}} type="button">
          <i class="download icon"></i>Identifiants
        </button>
        {{#unless @controller.isThematicResultMode}}
          <button class="ui button" {{on "click" @controller.getProfileId}} type="button">
            <i class="code icon"></i>CSV
          </button>
          <PdfExport @model={{@controller.areas}} />
        {{/unless}}

      </div>
    </div>
    <h2 class="ui top attached padded grid target-profile-title">
      <div class="row">
        {{#if @controller.isThematicResultMode}}
          <div class="eleven wide center aligned column"></div>
          <div class="four wide right aligned column">{{@controller.selectedThematicResultTubeCount}}
            /{{@controller.selectedTubeCount}}</div>
        {{else}}
          <div class="three wide column">
            <PixMultiSelect
              @options={{@controller.frameworkOptionList}}
              @values={{@controller.selectedFrameworkIds}}
              @onChange={{@controller.selectFrameworks}}
              @placeholder="Aucun référentiel sélectionné"
            >
              <:label>
                <span class="text-white">Référentiel</span>
              </:label>
              <:default as |frameworkOption|>{{frameworkOption.label}}</:default>
            </PixMultiSelect>
          </div>
          <div class="six wide center aligned column"></div>
          <div class="four wide right aligned column">{{@controller.selectedTubeCount}}/{{@controller.tubeCount}}</div>
        {{/if}}
      </div>
    </h2>
    <div class="ui attached target-profile">
      {{#each @controller.areas as |area|}}
        <AreaProfile
          @area={{area}}
          @displayTube={{@controller.displayTube}}
          @displayThematicResultTube={{@controller.displayThematicResultTube}}
          @level={{@controller.selectedTubeLevel}}
          @selectedSkills={{@controller.selectedTubeSkills}}
          @showTubeDetails={{@controller.showTubeDetails}}
          @clearTube={{@controller.unsetProfileTube}}
          @setTubeLevel={{@controller.setProfileTube}}
          @filter={{@controller.filter}}
          @isThematicResultMode={{@controller.isThematicResultMode}}
        />
      {{/each}}
      <Input @type="file" id="target-profile__open-file" {{on "change" @controller.openFile}} />
    </div>
  </div>
  <TubeLevel
    @setTubeLevel={{@controller.setTubeAction}}
    @clearTube={{@controller.clearTubeAction}}
    @skills={{@controller.tubeSkills}}
    @level={{@controller.selectedTubeLevel}}
    @selectedSkills={{@controller.selectedTubeSkills}}
    @tube={{@controller.selectedTube}}
    @isThematicResultMode={{@controller.isThematicResultMode}}
    @close={{@controller.closeTubeLevel}}
    @showModal={{@controller.displayTubeLevel}}
  />
  <SingleEntry
    @title={{@controller.singleEntryPopInTitle}}
    @label={{@controller.singleEntryPopInLabel}}
    @setValue={{@controller.singleEntryPopInAction}}
    @close={{@controller.closeSingleEntry}}
    @showModal={{@controller.displaySingleEntry}}
  />
  <ThresholdCalculation
    @title="Paliers indicatifs"
    @close={{@controller.closeThresholdCalculation}}
    @model={{@controller.areas}}
    @showModal={{@controller.displayThresholdCalculation}}
  />
</template>
