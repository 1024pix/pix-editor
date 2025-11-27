import Component from '@glimmer/component';
import eq from 'ember-truth-helpers/helpers/eq';
import { LinkTo } from '@ember/routing';
import GridCell from 'pixeditor/components/competence/grid/grid-cell';

export default class CompetenceCompetenceGridTubeComponent extends Component {
<template><td data-test-tube-cell class="tube-cell">
  {{#if (eq @section "skills")}}
    <LinkTo data-test-tube-managment @route="authenticated.competence.tubes.single" @model={{@tube}}>{{this.name}}</LinkTo>
  {{else}}
    {{this.name}}
  {{/if}}
</td>

{{#each this.skillOverviewsOrSkills as |skillOverviewOrSkill index|}}
  <GridCell @section={{@section}} @languageFilter={{@languageFilter}} @view={{@view}} @skill={{skillOverviewOrSkill.skill}} @skills={{skillOverviewOrSkill.skills}} @skillOverview={{skillOverviewOrSkill.skillOverview}} @link={{@link}} @tube={{@tube}} @tubeId={{@tubeOverview.airtableId}} @index={{index}} />
{{/each}}
</template>

get isOverview() {
  return this.args.tubeOverview != null;
}

get skillOverviewsOrSkills() {
  if (this.isOverview) {
    return this.args.tubeOverview.skillOverviews.map((skillOverview) => ({ skillOverview }));
  }
  if (this.args.view === 'workbench') {
    return this.args.tube.filledSkills.map((skills) => ({ skills, skill: skills[0] }));
  }
  if (this.args.view === 'draft') {
    return this.args.tube.filledLastDraftSkills.map((skill) => ({ skill }));
  }
  return this.args.tube.filledProductionSkills.map((skill) => ({ skill }));
}

get name() {
  return this.isOverview
    ? this.args.tubeOverview.name
    : this.args.tube.name;
}
}
