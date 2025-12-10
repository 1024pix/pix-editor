import CompetenceHeader from 'pixeditor/components/competence/competence-header';
import CompetenceActions from 'pixeditor/components/competence/competence-actions';
import CompetenceGrid from 'pixeditor/components/competence/competence-grid';
import Workbench from 'pixeditor/components/list/workbench';
import CompetenceFooter from 'pixeditor/components/competence/competence-footer';
import MainRightSlot from 'pixeditor/components/main-right-slot';

import Sorting from 'pixeditor/components/pop-in/sorting';

<template>
  <div class="main-left">
    <CompetenceHeader
      @competence={{@controller.competence}}
      @section={{@controller.section}}
      @languageFilter={{@controller.languageFilter}}
      @selectLanguageToFilter={{@controller.selectLanguageToFilter}}
      @view={{@controller.view}}
      @selectSection={{@controller.selectSection}}
    />
    {{#unless @controller.leftMaximized}}
      <CompetenceActions
        @section={{@controller.section}}
        @languageFilter={{@controller.languageFilter}}
        @view={{@controller.view}}
        @refresh={{@controller.refresh}}
        @selectView={{@controller.selectView}}
        @shareSkills={{@controller.exportSkills}}
      />
      <div class="ui attached segment competence {{@controller.size}}">
        {{#if @controller.displayGrid}}
          <CompetenceGrid
            @competence={{@controller.competence}}
            @competenceOverview={{@controller.competenceOverview}}
            @languageFilter={{@controller.languageFilter}}
            @section={{@controller.section}}
            @view={{@controller.view}}
            @newTube={{@controller.newTube}}
            @displaySortTubesPopIn={{@controller.displaySortTubesPopIn}}
            @link={{@controller.skillLink}}
          />
        {{else}}
          <Workbench
            @list={{@controller.competence.workbenchPrototypes}}
            @competenceModel={{@controller.model}}
            @link={{@controller.skillLink}}
          />
        {{/if}}
      </div>
      <CompetenceFooter
        @competence={{@controller.competence}}
        @competenceOverview={{@controller.competenceOverview}}
        @section={{@controller.section}}
        @view={{@controller.view}}
        @selectView={{@controller.selectView}}
        @newTheme={{@controller.newTheme}}
        @displaySortThemesPopIn={{@controller.displaySortThemesPopIn}}
        @newPrototype={{@controller.newPrototype}}
      />
    {{/unless}}
    {{outlet}}
  </div>
  {{#if @controller.twoColumns}}
    <MainRightSlot @onMount={{@controller.setMainRightSlot}} />
  {{/if}}
  <Sorting
    @title={{@controller.sortingPopInTitle}}
    @model={{@controller.sortingModel}}
    @onApprove={{@controller.sortingPopInApproveAction}}
    @onDeny={{@controller.sortingPopInCancelAction}}
    @showModal={{@controller.displaySortingPopIn}}
  />
</template>
