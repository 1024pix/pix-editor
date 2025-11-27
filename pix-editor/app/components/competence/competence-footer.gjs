import { service } from '@ember/service';
import Component from '@glimmer/component';
import { concat, fn } from '@ember/helper';
import eq from 'ember-truth-helpers/helpers/eq';
import { on } from '@ember/modifier';

export default class CompetenceFooter extends Component {
<template><div class="ui borderless bottom attached labelled icon menu{{this.skillClass}}">
  {{#if this.displayWorkbenchViews}}
    <button class={{concat "ui button item" (if (eq @view "workbench") " active" "")}} {{on "click" (fn @selectView "workbench")}} type="button">
      <i class="grid layout icon"></i>
    </button>
    <button class={{concat "ui button item" (if (eq @view "workbench-list") " active" "")}} {{on "click" (fn @selectView "workbench-list")}} type="button">
      <i class="align justify icon"></i>
    </button>
  {{/if}}
  {{#if this.mayCreateTheme}}
    <button class="ui button left item" {{on "click" @newTheme}} type="button">
      <i class="plus square outline icon"></i> Nouvelle Thématique
    </button>

    <button class="ui button left item" {{on "click" @displaySortThemesPopIn}} type="button">
      <i class="exchange icon rotate-90"></i> Trier les Thématiques
    </button>
  {{/if}}
  <div class="item competence-info">
    <div class="competence-info">Tubes : {{this.tubesCount}}</div>
    <div class="competence-info">Acquix : {{this.skillsCount}}</div>
  </div>
  {{#if this.mayCreatePrototype}}
    <button class="ui button right item" {{on "click" @newPrototype}} type="button">
      <i class="plus square outline icon" data-test-create-new-challenge></i> Nouveau prototype
    </button>
  {{/if}}
</div>
</template>

@service access;

get isOverview() {
  return this.args.competenceOverview != null;
}

get tubesCount() {
  if (this.isOverview) {
    return this.args.competenceOverview.tubesCount;
  }
  return this.displayProductionStats
    ? this.args.competence.productionTubeCount
    : this.args.competence.tubeCount;
}

get skillsCount() {
  if (this.isOverview) {
    return this.args.competenceOverview.skillsCount;
  }
  return this.displayProductionStats
    ? this.args.competence.productionSkillCount
    : this.args.competence.skillCount;
}

get skillClass() {
  return this.args.section === 'skills' ? ' skill-mode ' : '';
}

get displayWorkbenchViews() {
  return this.args.section === 'challenges' && this.args.view !== 'production';
}

get displayProductionStats() {
  const section = this.args.section;
  return section === 'quality' || (section === 'challenges' && this.args.view === 'production');
}

get mayCreateTheme() {
  const section = this.args.section;
  const view = this.args.view;
  return section === 'skills' && view === 'workbench' && this.access.mayCreateTheme();
}

get mayCreatePrototype() {
  const section = this.args.section;
  const view = this.args.view;
  return section === 'challenges' && (view === 'workbench' || view === 'workbench-list') && this.access.mayCreatePrototype();
}
}
