import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { Input } from '@ember/component';
import { on } from '@ember/modifier';
import SingleEntry from 'pixeditor/components/pop-in/single-entry';
import ThresholdCalculation from 'pixeditor/components/pop-in/threshold-calculation';
import TubeLevel from 'pixeditor/components/pop-in/tube-level';
import AreaProfile from 'pixeditor/components/target-profile/area-profile';
import PdfExport from 'pixeditor/components/target-profile/pdf-export';
<template>
  <div class="main-left target-profile-view">
    <div class="target-profile-view__title">
      <h1 class="target-profile-view__heading">{{if
          @controller.isThematicResultMode
          "Générateur de résultat thématique"
          "Générateur de profil cible"
        }}
        <div
          class="target-profile-view__filter
            {{if @controller.isThematicResultMode 'target-profile-view__filter--active'}}"
        >
          Résultat thématique
          <div class="target-profile-view__toggle">
            <Input
              id="thematicResult"
              @type="checkbox"
              @checked={{@controller.isThematicResultMode}}
              {{on "change" @controller.toggleThematicResult}}
              class="target-profile-view__toggle-input"
            />
            <label class="target-profile-view__toggle-label" for="thematicResult"></label>
          </div>
        </div>
        {{#unless @controller.isThematicResultMode}}
          <div
            class="target-profile-view__filter {{if @controller.showTubeDetails 'target-profile-view__filter--active'}}"
          >
            Détails des sujets
            <div class="target-profile-view__toggle">
              <Input
                id="tubeDetails"
                @type="checkbox"
                @checked={{@controller.showTubeDetails}}
                class="target-profile-view__toggle-input"
              />
              <label class="target-profile-view__toggle-label" for="tubeDetails"></label>
            </div>
          </div>
          <div class="target-profile-view__filter {{if @controller.filter 'target-profile-view__filter--active'}}">
            Filtrer les sujets sélectionnés
            <div class="target-profile-view__toggle">
              <Input
                id="filter"
                @type="checkbox"
                @checked={{@controller.filter}}
                class="target-profile-view__toggle-input"
              />
              <label class="target-profile-view__toggle-label" for="filter"></label>
            </div>
          </div>
        {{/unless}}
      </h1>
    </div>
    <div class="target-profile-view__menu">
      <div class="target-profile-view__menu-group">
        {{#unless @controller.isThematicResultMode}}
          <PixButton
            class="target-profile-view__menu-button"
            @variant="secondary"
            @iconBefore="upload"
            @triggerAction={{@controller.load}}
          >
            Ouvrir
          </PixButton>
          <PixButton
            class="target-profile-view__menu-button"
            @variant="secondary"
            @iconBefore="inboxIn"
            @triggerAction={{@controller.getSaveTitle}}
          >
            Enregistrer
          </PixButton>
        {{/unless}}
      </div>
      <div class="target-profile-view__menu-group target-profile-view__menu-group--right">
        {{#unless @controller.isThematicResultMode}}
          <PixButton
            class="target-profile-view__menu-button"
            @variant="secondary"
            @iconBefore="percent"
            @triggerAction={{@controller.showThresholdCalculation}}
          >
            Paliers indicatifs
          </PixButton>
        {{/unless}}
        <PixButton
          class="target-profile-view__menu-button"
          @variant="secondary"
          @iconBefore="download"
          @triggerAction={{@controller.getGenerateTitleOrThematicResultTitle}}
        >
          Identifiants
        </PixButton>
        {{#unless @controller.isThematicResultMode}}
          <PixButton
            class="target-profile-view__menu-button"
            @variant="secondary"
            @iconBefore="codeNumber"
            @triggerAction={{@controller.getProfileId}}
          >
            CSV
          </PixButton>
          <PdfExport @model={{@controller.areas}} />
        {{/unless}}
      </div>
    </div>
    <h2 class="target-profile-view__summary">
      <div class="target-profile-view__summary-row">
        {{#if @controller.isThematicResultMode}}
          <div class="target-profile-view__summary-spacer"></div>
          <div class="target-profile-view__summary-count">{{@controller.selectedThematicResultTubeCount}}
            /{{@controller.selectedTubeCount}}</div>
        {{else}}
          <div class="target-profile-view__summary-framework">
            <PixMultiSelect
              @options={{@controller.frameworkOptionList}}
              @values={{@controller.selectedFrameworkIds}}
              @onChange={{@controller.selectFrameworks}}
              @placeholder="Aucun référentiel sélectionné"
            >
              <:label>
                <span class="target-profile-view__framework-label">Référentiel</span>
              </:label>
              <:default as |frameworkOption|>{{frameworkOption.label}}</:default>
            </PixMultiSelect>
          </div>
          <div class="target-profile-view__summary-spacer"></div>
          <div
            class="target-profile-view__summary-count"
          >{{@controller.selectedTubeCount}}/{{@controller.tubeCount}}</div>
        {{/if}}
      </div>
    </h2>
    <div class="target-profile-view__body target-profile">
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
