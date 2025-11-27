import { service } from '@ember/service';
import Component from '@glimmer/component';
import and from 'ember-truth-helpers/helpers/and';
import { LinkTo } from '@ember/routing';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import eq from 'ember-truth-helpers/helpers/eq';
import CompetenceGridTube from 'pixeditor/components/competence/competence-grid-tube';

export default class CompetenceCompetenceGridThematicComponent extends Component {
<template>{{#if (and this.mayCreateTube this.hasNoTubes)}}
  <tr>
    <td data-test-theme-cell class="theme-cell create-tube">
      <LinkTo @route="authenticated.competence.themes.single" @model={{@thematic}}>{{this.name}}</LinkTo>
      <div class="ui mini basic icon buttons tube-management">
        <button data-test-add-tube class="ui icon button" {{on "click" (fn @newTube @thematic)}} title="Nouveau tube" type="button">
          <i class="plus square outline icon"></i>
        </button>
      </div>
    </td>
    <td data-test-empty-row colspan="8" class="empty-row"></td>
  </tr>
{{else}}
  {{#each this.tubeOverviewsOrTubes as |tubeOverviewOrTube index|}}
    <tr>
      {{#if (eq index 0)}}
        <td data-test-theme-cell rowspan={{this.rowSpan}} class="theme-cell {{if this.mayCreateTube "create-tube"}}">
          {{#if (eq @section "skills")}}
            <LinkTo data-test-theme-managment @route="authenticated.competence.themes.single" @model={{@thematic}}>{{this.name}}</LinkTo>
          {{else}}
            {{this.name}}
          {{/if}}
          {{#if this.mayCreateTube}}
            <div class="ui mini basic icon buttons tube-management">
              <button data-test-add-tube class="ui icon button" {{on "click" (fn @newTube @thematic)}} title="Nouveau tube" type="button">
                <i class="plus square outline icon"></i>
              </button>
              <button data-test-sort-tube class="ui icon button" {{on "click" (fn @displaySortTubesPopIn @thematic.tubes)}} title="Trier les Tubes" type="button">
                <i class="exchange icon rotate-90"></i>
              </button>
            </div>
          {{/if}}
        </td>
      {{/if}}
      <CompetenceGridTube @languageFilter={{@languageFilter}} @tube={{tubeOverviewOrTube.tube}} @tubeOverview={{tubeOverviewOrTube.tubeOverview}} @section={{@section}} @view={{@view}} @link={{@link}} />
    </tr>
  {{/each}}
{{/if}}
</template>

@service access;

get isOverview() {
  return this.args.thematicOverview != null;
}

get mayCreateTube() {
  const section = this.args.section;
  const view = this.args.view;
  return section === 'skills' && view === 'workbench' && this.access.mayCreateTube();
}

get tubes() {
  const thematic = this.args.thematic;
  if (this.args.view === 'workbench' || this.args.view === 'draft') {
    return thematic.tubes;
  }
  return thematic.productionTubes;
}

get tubeOverviewsOrTubes() {
  if (this.isOverview) {
    return this.args.thematicOverview.tubeOverviews.map((tubeOverview) => ({ tubeOverview }));
  }
  return this.tubes.map((tube) => ({ tube }));
}

get rowSpan() {
  return this.tubeOverviewsOrTubes.length;
}

get hasNoTubes() {
  if (this.args.thematicOverview) return false;
  const thematic = this.args.thematic;
  return thematic.tubes.length === 0;
}

get name() {
  return this.isOverview
    ? this.args.thematicOverview.name
    : this.args.thematic.name;
}
}
