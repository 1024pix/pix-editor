import { PixMultiSelect, PixToggle } from '@1024pix/nebulix-ember';
import { Input } from '@ember/component';
import { on } from '@ember/modifier';
import SingleEntry from 'pixeditor/components/pop-in/single-entry';
import ThresholdCalculation from 'pixeditor/components/pop-in/threshold-calculation';
import TubeLevel from 'pixeditor/components/pop-in/tube-level';
import AreaProfile from 'pixeditor/components/target-profile/area-profile';
import PdfExport from 'pixeditor/components/target-profile/pdf-export';

// TRADUCTIONS PIXMULTISELECT
const multiselectTranslationList = {
  placeholder: 'Aucun référentiel sélectionné',
};

<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">{{if
          @controller.isThematicResultMode
          "Générateur de résultat thématique"
          "Générateur de profil cible"
        }}
      </h1>
      <div class="target-profile-view__filters">
        <PixToggle @checked={{@controller.isThematicResultMode}} {{on "change" @controller.toggleThematicResult}}>
          Résultat thématique
        </PixToggle>
        {{#unless @controller.isThematicResultMode}}
          <PixToggle @checked={{@controller.showTubeDetails}} {{on "change" @controller.toggleTubeDetails}}>
            Détails des sujets
          </PixToggle>
          <PixToggle @checked={{@controller.filter}} {{on "change" @controller.toggleFilter}}>
            Filtrer les sujets sélectionnés
          </PixToggle>
        {{/unless}}
      </div>
    </header>
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
              @texts={{multiselectTranslationList}}
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
